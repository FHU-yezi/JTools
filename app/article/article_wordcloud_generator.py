from collections import Counter
from typing import List, Set, Tuple

import jieba
import jieba.posseg as pseg
import pyecharts.options as opts
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article
from pyecharts.charts import WordCloud
from pywebio.output import put_html, toast
from pywebio.pin import pin, put_input

from utils.callback import bind_enter_key_callback
from utils.chart import (
    ANIMATION_OFF,
    JIANSHU_COLOR,
    TOOLBOX_ONLY_SAVE_PNG_WHITE_2X,
)
from utils.text_filter import input_filter
from utils.widgets import (
    green_loading,
    toast_error_and_return,
    toast_warn_and_return,
    use_result_scope,
)
from widgets.button import put_button

NAME: str = "文章词云图生成工具"
DESC = "生成文章词云图。"

jieba.logging.disable()

ALLOWED_WORD_TYPES: Set[str] = {
    x.strip()
    for x in open(  # noqa
        "wordcloud_assets/allowed_word_types.txt", encoding="utf-8"
    ).readlines()
}
(
    jieba.add_word(word)
    for word in open("wordcloud_assets/hotwords.txt", encoding="utf-8")  # noqa
)  # 将热点词加入词库


def get_word_freq(text: str) -> Tuple[Tuple[str, int], ...]:
    processed_text: List[str] = [
        x.word
        for x in pseg.cut(text)
        if len(x.word) > 1  # 剔除单字词
        and x.flag in ALLOWED_WORD_TYPES  # 剔除不符合词性要求的词
    ]
    return tuple(Counter(processed_text).items())


def on_generate_button_clicked() -> None:
    url: str = input_filter(pin.url)  # type: ignore

    if not url:
        toast_warn_and_return("请输入简书文章 URL")

    try:
        article = Article.from_url(url)
    except InputError:
        toast_error_and_return("输入的不是简书文章 URL，请检查")
    except ResourceError:
        toast_error_and_return("文章已被删除、锁定或正在审核中，无法获取内容")

    with green_loading():
        title: str = article.title
        text: str = article.text

        word_freq = get_word_freq(text)

        wordcloud = (
            WordCloud(
                init_opts=opts.InitOpts(
                    width="800px",
                    height="500px",
                    animation_opts=ANIMATION_OFF,
                )
            )
            .add(
                "",
                data_pair=word_freq,
                word_size_range=(20, 70),
                pos_left="center",
                pos_top="center",
                textstyle_opts=opts.TextStyleOpts(
                    color=JIANSHU_COLOR,
                ),
            )
            .set_global_opts(
                title_opts=opts.TitleOpts(
                    pos_left="30px",
                    pos_top="5px",
                    title=f"{title} 的词云图",
                    subtitle=url,
                ),
                toolbox_opts=TOOLBOX_ONLY_SAVE_PNG_WHITE_2X,
            )
        )

        with use_result_scope():
            toast("词云图已生成", color="success")
            put_html(wordcloud.render_notebook())


def article_wordcloud_generator() -> None:
    put_input(
        "url",
        type="text",
        label="文章 URL",
    )
    put_button(
        "生成",
        color="success",
        onclick=on_generate_button_clicked,
        block=True,
    )
    bind_enter_key_callback(
        "url",
        on_press=lambda _: on_generate_button_clicked(),
    )
