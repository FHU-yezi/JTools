from os import remove

from JianshuResearchTools.article import (GetArticleAuthorName,
                                          GetArticleMarkdown, GetArticleText,
                                          GetArticleTitle)
from JianshuResearchTools.assert_funcs import AssertArticleUrl
from JianshuResearchTools.exceptions import InputError
from pywebio import pin
from pywebio.input import TEXT
from pywebio.output import download, put_button, put_markdown, toast

from .utils import LinkInHTML, SetFooter


def ArticleDownloader():
    """简书小工具集：文章下载工具"""

    def download_content(format):
        if format not in ["txt", "markdown"]:
            toast("格式无效，请检查", color="error")
            return  # 发生错误，不再运行后续逻辑
        if "我已阅读以上提示并将合规使用文章内容" not in pin.pin["warning"]:
            toast("请先勾选免责信息", color="error")
            return  # 用户未勾选免责，不再运行后续逻辑
        try:
            AssertArticleUrl(pin.pin["url"])
        except InputError:
            toast("输入的 URL 无效，请检查")
            return  # 发生错误，不再运行后续逻辑
        if format == "txt":
            filename = GetArticleTitle(pin.pin["url"]) + "_" + GetArticleAuthorName(pin.pin["url"]) + ".txt"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(GetArticleText(pin.pin["url"]))
        elif format == "markdown":
            filename = GetArticleTitle(pin.pin["url"]) + "_" + GetArticleAuthorName(pin.pin["url"]) + ".md"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(GetArticleMarkdown(pin.pin["url"]))

        toast("文章内容获取成功", color="success")
        with open(filename, "rb") as f:
            download(filename, f.read())  # 向浏览器发送文件下载请求

        remove(filename)  # 删除临时文件

    put_markdown("""
    # 文章下载工具
    本工具可下载简书中的文章内容，并将其保存至本地。

    **请注意：本工具可以下载设置为禁止转载的文章内容，您需自行承担不规范使用可能造成的版权风险。**
    """, lstrip=True)

    pin.put_input("url", type=TEXT, label="要下载的文章链接")
    pin.put_checkbox("warning", options=["我已阅读以上提示并将合规使用文章内容"])
    put_button("下载纯文本格式", onclick=lambda: download_content("txt"))
    put_button("下载 Markdown 格式", onclick=lambda: download_content("markdown"))

    SetFooter(f"Powered By \
              {LinkInHTML('JRT', 'https://github.com/FHU-yezi/JianshuResearchTools/')} \
              and {LinkInHTML('PyWebIO', 'https://github.com/pywebio/PyWebIO')}")
