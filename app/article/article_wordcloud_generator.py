from collections import Counter
from typing import List, Set

import jieba
import jieba.posseg as pseg
import pyecharts.options as opts
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article
from pyecharts.charts import WordCloud
from pyecharts.globals import CurrentConfig
from pywebio.output import put_button, put_html, toast, use_scope
from pywebio.pin import pin, put_input
from utils.config import config
from utils.user_input_filter import user_input_filter
from utils.widgets import (green_loading, toast_error_and_return,
                           toast_warn_and_return)

# 设置 PyEcharts CDN
CurrentConfig.ONLINE_HOST = config.deploy.pyecharts_cdn

NAME: str = "文章词云图生成工具"
DESC = "生成文章词云图。"

jieba.logging.disable()

STOPWORDS: Set[str] = {
    x.strip() for x in
    open("wordcloud_assets/stopwords.txt", encoding="utf-8").readlines()
}
ALLOWED_WORD_TYPES: Set[str] = {
    x.strip() for x in
    open("wordcloud_assets/allowed_word_types.txt", encoding="utf-8").readlines()
}
(jieba.add_word(word) for word in open("wordcloud_assets/hotwords.txt", encoding="utf-8"))  # 将热点词加入词库


def get_word_freq(text: str):
    processed_text: List[str] = [
        x.word for x in pseg.cut(text)
        if len(x.word) > 1  # 剔除单字词
        and x.word not in STOPWORDS  # 剔除禁用词
        and x.flag in ALLOWED_WORD_TYPES  # 剔除不符合词性要求的词
    ]
    return Counter(processed_text).items()


def on_generate_button_clicked() -> None:
    url: str = user_input_filter(pin.url)

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
            WordCloud()
            .add(series_name="", data_pair=word_freq, word_size_range=[20, 70])
            .set_global_opts(
                title_opts=opts.TitleOpts(title=f"{title} 的词云图", subtitle=url),
                # 支持下载到本地
                toolbox_opts=opts.ToolboxOpts(is_show=True, feature={"saveAsImage": {}})
            )
        )

        with use_scope("result", clear=True):
            toast("词云图已生成", color="success")
            put_html(wordcloud.render_notebook())


def article_wordcloud_generator() -> None:
    put_input("url", type="text", label="文章 URL")
    put_button("生成", color="success", onclick=on_generate_button_clicked)
