from collections import Counter

import jieba
import jieba.posseg as pseg
from config_manager import Config
from JianshuResearchTools.assert_funcs import (AssertArticleStatusNormal,
                                               AssertArticleUrl)
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article
from PIL import Image
from pywebio.input import TEXT
from pywebio.output import (put_button, put_image, put_loading, put_markdown,
                            toast, use_scope)
from pywebio.pin import pin, put_input
from wordcloud import WordCloud

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
        AssertArticleUrl(url)
        AssertArticleStatusNormal(url)
    except (InputError, ResourceError):
        toast("输入的 URL 无效，请检查", color="error")
        return  # 发生错误，不再运行后续逻辑

    with put_loading(color="success"):  # 显示加载动画
        text = Article(article_url=url).text
        cutted_text = pseg.cut(text)
        cutted_text = (x.word for x in cutted_text if len(x.word) > 1
                       and x.flag in ALLOW_WORD_TYPES and x.word not in STOPWORDS)
        wordcloud = WordCloud(font_path="wordcloud_assets/font.otf", width=1920, height=1080,
                              background_color="white", max_words=100)
        img = wordcloud.generate_from_frequencies(Counter(cutted_text))
        with use_scope("output", clear=True):
            put_markdown("---")  # 分割线

            put_image(Image.fromarray(img.to_array()))


def ArticleWordcloudGenerator():
    """文章词云图生成工具"""

    put_markdown("""
    # 文章词云图生成工具
    本工具可生成简书文章的词云图。
    """)

    put_input("url", type=TEXT, label="请输入文章 URL：")
    put_button("生成词云图", OnGenerateButtonClicked)

    SetFooter(Config()["service_pages_footer"])
