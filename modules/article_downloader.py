from config_manager import config
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article
from pywebio.input import TEXT
from pywebio.output import download, put_buttons, put_markdown, toast
from pywebio.pin import pin, put_checkbox, put_input

from .utils import SetFooter


def OnDownloadButtonClicked(format: str):
    warning = pin.warning
    url = pin.url

    if "我已阅读以上提示并将合规使用文章内容" not in warning:
        toast("请先勾选免责信息", color="error")
        return

    try:
        article = Article.from_url(url)
    except (InputError, ResourceError):
        toast("输入的 URL 无效，请检查", color="error")
        return

    filename = f"{article.title}_{article.author_name}.{format}"

    if format == "txt":
        content = bytes(article.text.encode("utf-8"))
    elif format == "md":
        content = bytes(article.markdown.encode("utf-8"))

    toast("获取文章内容成功", color="success")
    download(filename, content)  # 向浏览器发送文件下载请求


def ArticleDownloader():
    """简书小工具集：文章下载工具"""

    put_markdown("""
    # 文章下载工具
    本工具可下载简书中的文章内容，并将其保存至本地。

    **请注意：本工具可以下载设置为禁止转载的文章内容，您需自行承担不规范使用带来的版权风险。**
    """)

    put_input("url", type=TEXT, label="请输入文章 URL：")
    put_checkbox("warning", options=["我已阅读以上提示并将合规使用文章内容"])
    put_buttons(["下载纯文本格式", "下载 Markdown 格式"],
                onclick=(lambda: OnDownloadButtonClicked("txt"),
                         lambda: OnDownloadButtonClicked("md")))

    SetFooter(config["service_pages_footer"])
