from collections import Counter

import jieba
import jieba.posseg as pseg
import pyecharts.options as opts
from config_manager import Config
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article
from pyecharts.charts import WordCloud
from pywebio.input import TEXT
from pywebio.output import (put_button, put_html, put_loading, put_markdown,
                            toast, use_scope)
from pywebio.pin import pin, put_input

from .utils import SetFooter

jieba.setLogLevel(jieba.logging.ERROR)  # 关闭 jieba 的日志输出

STOPWORDS = list(open("wordcloud_assets/stopwords.txt", encoding="utf-8"))
(jieba.add_word(word) for word in open("wordcloud_assets/hotwords.txt", encoding="utf-8"))  # 将热点词加入词库

ALLOW_WORD_TYPES = ("Ag", "a", "ad", "an", "dg", "g",
                    "i", "j", "l", "Ng", "n", "nr",
                    "ns", "nt", "nz", "tg", "vg", "v",
                    "vd", "vn", "un")


def OnGenerateButtonClicked():
    url = pin.url

    try:
        article = Article.from_url(url)
    except (InputError, ResourceError):
        toast("输入的 URL 无效，请检查", color="error")
        return

    with put_loading(color="success"):  # 显示加载动画
        title = article.title
        text = article.text
        cutted_text = pseg.cut(text)
        cutted_text = (x.word for x in cutted_text if len(x.word) > 1
                       and x.flag in ALLOW_WORD_TYPES and x.word not in STOPWORDS)

        wordcloud = (
            WordCloud()
            .add(series_name="", data_pair=Counter(cutted_text).items(), word_size_range=[15, 70])
            .set_global_opts(
                title_opts=opts.TitleOpts(title=f"{title} 的词云图", subtitle=f"{url}"),
                toolbox_opts=opts.ToolboxOpts(is_show=True, feature={"saveAsImage": {}}),
            )
        )
        with use_scope("output", clear=True):
            put_markdown("---")  # 分割线

            put_html(wordcloud.render_notebook())


def ArticleWordcloudGenerator():
    """文章词云图生成工具"""

    put_markdown("""
    # 文章词云图生成工具
    本工具可生成简书文章的词云图。
    """)

    put_input("url", type=TEXT, label="请输入文章 URL：")
    put_button("生成词云图", OnGenerateButtonClicked)

    SetFooter(Config()["service_pages_footer"])
