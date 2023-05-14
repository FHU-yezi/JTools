from typing import Callable, Dict, Iterable, Tuple

from JianshuResearchTools.assert_funcs import (
    AssertArticleUrl,
    AssertCollectionUrl,
    AssertJianshuUrl,
    AssertNotebookUrl,
    AssertUserUrl,
)
from JianshuResearchTools.convert import (
    ArticleUrlToArticleUrlScheme,
    CollectionUrlToCollectionUrlScheme,
    NotebookUrlToNotebookUrlScheme,
    UserUrlToUserUrlScheme,
)
from JianshuResearchTools.exceptions import InputError
from pywebio.output import put_image, put_markdown, toast
from pywebio.pin import pin, put_input
from sspeedup.make_qrcode import make_qrcode
from sspeedup.pywebio.callbacks import on_enter_pressed
from sspeedup.pywebio.loading import green_loading
from sspeedup.pywebio.scope import use_clear_scope
from sspeedup.pywebio.toast import toast_error_and_return, toast_warn_and_return

from utils.text_filter import input_filter
from widgets.button import put_button

NAME = "URL Scheme 转换工具"
DESC = "将简书链接转换为 URL Scheme，从而在 App 端实现一键跳转。"

ASSERT_FUNCS: Iterable[Tuple[Callable[[str], None], str]] = (
    (AssertArticleUrl, "article"),
    (AssertUserUrl, "user"),
    (AssertCollectionUrl, "collection"),
    (AssertNotebookUrl, "notebook"),
)

CONVERT_FUNCS: Dict[str, Callable[[str], str]] = {
    "article": ArticleUrlToArticleUrlScheme,
    "user": UserUrlToUserUrlScheme,
    "collection": CollectionUrlToCollectionUrlScheme,
    "notebook": NotebookUrlToNotebookUrlScheme,
}


def get_url_type(url: str) -> str:
    for assert_func, url_type in ASSERT_FUNCS:
        try:
            assert_func(url)
        except InputError:  # 类型错误
            pass
        else:
            return url_type
    raise InputError("URL 匹配失败")


def get_convert_result(url: str, url_type: str) -> str:
    return CONVERT_FUNCS[url_type](url)


def on_convert_button_cilcked() -> None:
    url: str = input_filter(pin.url)  # type: ignore

    if not url:
        toast_warn_and_return("请输入简书 URL")

    with green_loading():
        try:
            AssertJianshuUrl(url)
        except InputError:
            toast_error_and_return("输入的不是简书 URL，请检查")

        try:
            url_type: str = get_url_type(url)
        except InputError:
            toast_error_and_return("输入的链接无效或不支持该类型转换")

        result = get_convert_result(url, url_type)
        qr_code = make_qrcode(result)

    toast("转换成功", color="success")
    with use_clear_scope("result"):
        put_markdown(f"转换结果：`{result}`")
        put_image(qr_code)


def URL_scheme_convertor() -> None:  # noqa
    put_markdown(
        """
        目前支持转换的链接类型：

        - 文章
        - 用户
        - 专题
        - 文集
        """
    )

    put_input(
        "url",
        type="text",
        label="简书 URL",
    )
    put_button(
        "转换",
        color="success",
        onclick=on_convert_button_cilcked,
        block=True,
    )
    on_enter_pressed(
        "url",
        func=on_convert_button_cilcked,
    )
