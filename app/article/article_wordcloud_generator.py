import pyecharts.options as opts
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article
from pyecharts.charts import WordCloud
from pywebio.output import put_html, toast
from pywebio.pin import pin, put_input
from sspeedup.ability.word_split.jieba import AbilityJiebaPossegSplitterV1
from sspeedup.pywebio.callbacks import on_enter_pressed
from sspeedup.pywebio.loading import green_loading
from sspeedup.pywebio.scope import use_clear_scope
from sspeedup.pywebio.toast import toast_error_and_return, toast_warn_and_return

from utils.chart import (
    ANIMATION_OFF,
    JIANSHU_COLOR,
    TOOLBOX_ONLY_SAVE_PNG_WHITE_2X,
)
from utils.config import config
from utils.text_filter import input_filter
from widgets.button import put_button

NAME = "文章词云图生成工具"
DESC = "生成文章词云图。"


word_splitter = AbilityJiebaPossegSplitterV1(
    host=config.word_split_ability.host,
    port=config.word_split_ability.port,
    allowed_word_types_file="wordcloud_assets/allowed_word_types.txt",
)


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

        word_freq = word_splitter.get_word_freq(text).most_common(200)

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

    with use_clear_scope("result"):
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
    on_enter_pressed(
        "url",
        func=on_generate_button_clicked,
    )
