from collections import Counter

import jieba
from JianshuResearchTools.article import GetArticleText
from JianshuResearchTools.assert_funcs import AssertArticleUrl
from JianshuResearchTools.exceptions import InputError
from PIL import Image
from pywebio import pin
from pywebio.input import TEXT
from pywebio.output import put_button, put_image, put_markdown, toast
from wordcloud import WordCloud

from .utils import LinkInHTML, SetFooter


jieba.setLogLevel(jieba.logging.ERROR)  # 关闭 jieba 的日志输出

stopwords = [word for word in open("wordcloud_assets/stopwords.txt", encoding="utf-8")]  # 预加载停用词词库
[jieba.add_word(word) for word in open("wordcloud_assets/hotwords.txt", encoding="utf-8")]  # 将热点词加入词库


def ArticleWordcloudGenerator():
    """文章词云图生成工具"""

    def GeneratorWordcloud():
        try:
            AssertArticleUrl(pin.pin["url"])
        except InputError:
            toast("输入的 URL 无效，请检查", color="error")
            return  # 发生错误，不再运行后续逻辑

        text = GetArticleText(pin.pin["url"])
        cutted_text = jieba.cut(text)
        cutted_text = [word for word in cutted_text if len(word) > 1 and word not in stopwords]
        wordcloud = WordCloud(font_path="font.otf", width=1280, height=720, background_color="white")
        img = wordcloud.generate_from_frequencies(Counter(cutted_text))
        img = Image.fromarray(img.to_array())
        put_image(img)

    put_markdown("""
    # 文章词云图生成工具
    本工具可生成简书文章的词云图。
    """, lstrip=True)

    pin.put_input("url", type=TEXT, label="文章链接")
    put_button("生成词云图", GeneratorWordcloud)

    SetFooter(f"Powered By \
              {LinkInHTML('JRT', 'https://github.com/FHU-yezi/JianshuResearchTools/')} \
              and {LinkInHTML('PyWebIO', 'https://github.com/pywebio/PyWebIO')}")
