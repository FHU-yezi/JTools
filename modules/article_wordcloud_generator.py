from collections import Counter

import jieba
from JianshuResearchTools.article import GetArticleText
from JianshuResearchTools.assert_funcs import AssertArticleUrl
from JianshuResearchTools.exceptions import InputError
from PIL import Image
from pywebio.input import TEXT
from pywebio.output import (put_button, put_image, put_markdown, toast,
                            use_scope)
from pywebio.pin import pin, put_input
from wordcloud import WordCloud

from .utils import LinkInHTML, SetFooter

jieba.setLogLevel(jieba.logging.ERROR)  # 关闭 jieba 的日志输出

STOPWORDS = [word for word in open("wordcloud_assets/stopwords.txt", encoding="utf-8")]  # 预加载停用词词库
(jieba.add_word(word) for word in open("wordcloud_assets/hotwords.txt", encoding="utf-8"))  # 将热点词加入词库


def GeneratorWordcloud():
    try:
        AssertArticleUrl(pin["url"])
    except InputError:
        toast("输入的 URL 无效，请检查", color="error")
        return  # 发生错误，不再运行后续逻辑

    text = GetArticleText(pin["url"])
    cutted_text = jieba.cut(text)
    cutted_text = (word for word in cutted_text if len(word) > 1 and word not in STOPWORDS)
    wordcloud = WordCloud(font_path="font.otf", width=2560, height=1440, background_color="white")
    img = wordcloud.generate_from_frequencies(Counter(cutted_text))
    with use_scope("output", clear=True):
        put_image(Image.fromarray(img.to_array()))


def ArticleWordcloudGenerator():
    """文章词云图生成工具"""

    put_markdown("""
    # 文章词云图生成工具
    本工具可生成简书文章的词云图。
    """)

    put_input("url", type=TEXT, label="文章链接")
    put_button("生成词云图", GeneratorWordcloud)

    SetFooter(f"Powered By \
              {LinkInHTML('JRT', 'https://github.com/FHU-yezi/JianshuResearchTools/')} \
              and {LinkInHTML('PyWebIO', 'https://github.com/pywebio/PyWebIO')}")
