from typing import Callable, Dict, Iterable, Tuple

from JianshuResearchTools.assert_funcs import (AssertArticleUrl,
                                               AssertCollectionUrl,
                                               AssertJianshuUrl,
                                               AssertNotebookUrl,
                                               AssertUserUrl)
from JianshuResearchTools.convert import (ArticleUrlToArticleUrlScheme,
                                          CollectionUrlToCollectionUrlScheme,
                                          NotebookUrlToNotebookUrlScheme,
                                          UserUrlToUserUrlScheme)
from JianshuResearchTools.exceptions import InputError
from pywebio.output import (put_button, put_image, put_loading, put_markdown,
                            toast, use_scope)
from pywebio.pin import pin, put_input

from utils.qrcode_helper import make_qrcode

DESCRIPTION: str = """URL Scheme 转换工具"""

ASSERT_FUNCS: Iterable[Tuple[Callable, str]] = (
    (AssertArticleUrl, "article"),
    (AssertUserUrl, "user"),
    (AssertCollectionUrl, "collection"),
    (AssertNotebookUrl, "notebook")
)

CONVERT_FUNCS: Dict[str, Callable] = {
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
    raise TypeError("URL 匹配失败")


def get_convert_result(url: str, url_type: str) -> str:
    return CONVERT_FUNCS[url_type](url)


def on_convert_button_cilcked() -> None:
    url: str = pin.url

    with put_loading(color="success"):
        try:
            AssertJianshuUrl(url)
        except InputError:
            toast("输入的不是简书 URL,请检查", color="error")
            return

        try:
            url_type: str = get_url_type(url)
        except InputError:
            toast("输入的链接无效户不支持该类型转换", color="error")
            return

        result = get_convert_result(url, url_type)
        qr_code = make_qrcode(result)

    toast("转换成功", color="success")
    with use_scope("result", clear=True):
        put_markdown(f"转换结果：`{result}`")
        put_image(qr_code)


def URL_scheme_convertor() -> None:
    put_markdown("""
    # URL Scheme 转换工具

    将简书链接转换为 URL Schem，从而在 App 端实现一键跳转。

    目前支持转换的链接类型：

    - 文章
    - 用户
    - 专题
    - 文集
    """)

    put_input("url", type="text", label="简书 URL")
    put_button("转换", color="success", onclick=on_convert_button_cilcked)
