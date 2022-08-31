from collections import Counter
from typing import List

import jieba
import jieba.posseg as pseg
import pyecharts.options as opts
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article
from pyecharts.charts import WordCloud
from pywebio.output import put_button, put_html, put_loading, toast, use_scope
from pywebio.pin import pin, put_input

NAME: str = "文章词云图生成工具"
DESC = "生成简书文章的词云图。"

jieba.logging.disable()

STOPWORDS: List[str] = [
    x.strip() for x in
    open("wordcloud_assets/stopwords.txt", encoding="utf-8").readlines()
]
ALLOWED_WORD_TYPES: List[str] = [
    x.strip() for x in
    open("wordcloud_assets/allowed_word_types.txt", encoding="utf-8").readlines()
]
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
    url: str = pin.url

    if not url:
        toast("请输入简书文章 URL", color="warn")
        return

    try:
        article = Article.from_url(url)
    except InputError:
        toast("输入的不是简书文章 URL，请检查", color="error")
        return
    except ResourceError:
        toast("文章已被删除、锁定或正在审核中，无法获取内容", color="error")
        return

    with put_loading(color="success"):
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
