from typing import List

from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article
from pywebio.output import download, put_markdown, toast
from pywebio.pin import pin, put_checkbox, put_input, put_radio
from sspeedup.pywebio.callbacks import on_enter_pressed
from sspeedup.pywebio.loading import green_loading
from sspeedup.pywebio.toast import toast_error_and_return, toast_warn_and_return

from utils.checkbox_helper import is_checked
from utils.text_filter import input_filter
from widgets.button import put_button

NAME: str = "文章下载工具"
DESC: str = "下载文章内容，并将其以纯文本或 Markdown 格式保存至本地。"


def on_download_button_clicked() -> None:
    url: str = input_filter(pin.url)  # type: ignore
    download_format: str = pin.download_format  # type: ignore
    warning: List[str] = pin.warning  # type: ignore

    if not url:
        toast_warn_and_return("请输入简书文章 URL")

    if not is_checked("我同意合规使用该文章", warning):
        toast_warn_and_return("请先同意合规使用文章")

    try:
        article = Article.from_url(url)
    except InputError:
        toast_error_and_return("输入的不是简书文章 URL，请检查")
    except ResourceError:
        toast_error_and_return("文章已被删除、锁定或正在审核中，无法获取内容")

    with green_loading():
        title = article.title
        file_name = f"{title}.{download_format}"

        text = article.text if download_format == "txt" else article.markdown
        bytes_flow = bytes(text.encode("utf-8"))

    toast("文章已开始下载", color="success")
    download(file_name, bytes_flow)


def article_downloader() -> None:
    put_markdown("**请注意：不规范使用文章可能带来版权风险。**")

    put_input(
        "url",
        type="text",
        label="文章 URL",
    )
    put_radio(
        "download_format",
        label="下载格式",
        options=[
            ("纯文本", "txt", True),
            ("Markdown", "md"),
        ],  # 默认选中
    )
    put_checkbox(
        "warning",
        options=["我同意合规使用该文章"],
    )
    put_button(
        "下载",
        color="success",
        onclick=on_download_button_clicked,
        block=True,
    )
    on_enter_pressed(
        "url",
        func=on_download_button_clicked,
    )
