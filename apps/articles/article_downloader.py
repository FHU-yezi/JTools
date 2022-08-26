from typing import List, Optional

from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article
from pywebio.input import TEXT
from pywebio.output import (download, put_button, put_loading, put_markdown,
                            toast)
from pywebio.pin import pin, put_checkbox, put_input, put_radio
from utils.checkbox_helper import is_checked

DESCRIPTION: str = """文章下载工具"""


def on_download_button_clicked() -> None:
    url: str = pin.url
    download_format: str = pin.download_format
    warning: List[Optional[str]] = pin.warning

    if not url:
        toast("请输入简书文章 URL", color="error")
        return

    if not is_checked("我同意合规使使该文章", warning):
        toast("请先同意合规使用文章", color="warn")
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
        title = article.title
        file_name = f"{title}.{download_format}"

        text = article.text if download_format == "txt" \
            else article.markdown
        bytes_flow = bytes(text.encode("utf-8"))

    toast("文章已开始下载", color="success")
    download(file_name, bytes_flow)


def article_downloader() -> None:
    put_markdown("""
    # 文章下载工具

    本工具可下载简书文章内容，并将其以纯文本或 Markdown 格式保存至本地。

    **请注意：不规范使用文章可能带来版权风险。**
    """)

    put_input("url", type=TEXT, label="文章 URL")
    put_radio(
        "download_format", label="下载格式",
        options=[
            ("纯文本", "txt", True),  # 默认选中
            ("Markdown", "md")
        ]
    )
    put_checkbox("warning", options=["我同意合规使用该文章"])
    put_button("下载", color="success", onclick=on_download_button_clicked)
