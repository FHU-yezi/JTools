from tempfile import SpooledTemporaryFile

from config_manager import Config
from JianshuResearchTools.article import (GetArticleAuthorName,
                                          GetArticleMarkdown, GetArticleText,
                                          GetArticleTitle)
from JianshuResearchTools.assert_funcs import (AssertArticleStatusNormal,
                                               AssertArticleUrl)
from JianshuResearchTools.exceptions import InputError, ResourceError
from pywebio.input import TEXT
from pywebio.output import download, put_buttons, put_markdown, toast
from pywebio.pin import pin, put_checkbox, put_input

from .utils import SetFooter


def DownloadContent(format):
    if "我已阅读以上提示并将合规使用文章内容" not in pin["warning"]:
        toast("请先勾选免责信息", color="error")
        return  # 用户未勾选免责，不再运行后续逻辑

    url = pin["url"]
    try:
        AssertArticleUrl(url)
        AssertArticleStatusNormal(url)
    except (InputError, ResourceError):
        toast("输入的 URL 无效，请检查", color="error")
        return  # 发生错误，不再运行后续逻辑
    else:
        title = GetArticleTitle(url, disable_check=True)
        author_name = GetArticleAuthorName(url, disable_check=True)
        filename = f"{title}_{author_name}.{format}"

    # 创建临时文件，在其大小大于 1MB 时将其写入硬盘（应该不会有这么长的文章吧）
    with SpooledTemporaryFile(mode="wb+", max_size=1 * 1024 * 1024) as f:
        if format == "txt":
            f.write(bytes(GetArticleText(url, disable_check=True), encoding="utf-8"))
        elif format == "markdown":
            f.write(bytes(GetArticleMarkdown(url, disable_check=True), encoding="utf-8"))

        toast("获取文章内容成功", color="success")
        f.seek(0)  # 将内容指针放到文件开头
        download(filename, f.read())  # 向浏览器发送文件下载请求


def ArticleDownloader():
    """简书小工具集：文章下载工具"""

    put_markdown("""
    # 文章下载工具
    本工具可下载简书中的文章内容，并将其保存至本地。

    **请注意：本工具可以下载设置为禁止转载的文章内容，您需自行承担不规范使用带来的版权风险。**
    """)

    put_input("url", type=TEXT, label="要下载的文章链接")
    put_checkbox("warning", options=["我已阅读以上提示并将合规使用文章内容"])
    put_buttons(["下载纯文本格式", "下载 Markdown 格式"],
                onclick=(lambda: DownloadContent("txt"), lambda: DownloadContent("markdown")))

    SetFooter(Config()["service_pages_footer"])
