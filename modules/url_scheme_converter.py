from typing import Callable, Dict, Iterable, Tuple

from config_manager import config
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
from pywebio.input import TEXT
from pywebio.output import (put_button, put_image, put_link, put_markdown,
                            toast, use_scope)
from pywebio.pin import pin, put_input
from qrcode import make as make_qrcode

from .utils import SetFooter

ASSERT_FUNCS: Iterable[Tuple[Callable, str]] = (
    (AssertArticleUrl, "article"),
    (AssertCollectionUrl, "collection"),
    (AssertNotebookUrl, "notebook"),
    (AssertUserUrl, "user")
)

CONVERT_FUNCS: Dict[str, Callable] = {
    "article": ArticleUrlToArticleUrlScheme,
    "collection": CollectionUrlToCollectionUrlScheme,
    "notebook": NotebookUrlToNotebookUrlScheme,
    "user": UserUrlToUserUrlScheme
}


def OnConvertButtonClicked():
    url = pin.url

    try:
        AssertJianshuUrl(url)
    except InputError:
        toast("输入的链接无效，请检查", color="error")
        return

    for assert_func, scheme in ASSERT_FUNCS:
        try:
            assert_func(url)
        except InputError:  # 类型错误
            continue
        else:  # 类型正确
            url_type = scheme
            break
    else:  # 未匹配到
        toast("输入的链接无效或不支持此类型转换，请检查", color="error")
        return

    result = CONVERT_FUNCS[url_type](url)

    with use_scope("output", clear=True):
        put_markdown("---")  # 分割线
        put_markdown("**转换结果**：")

        put_link(name=result, url=result, new_window=True)
        img = make_qrcode(result)._img
        put_image(img)


def URLSchemeConverter():
    """简书小工具集：URL Scheme 转换工具"""

    put_markdown("""
    # URL Scheme 转换工具

    本工具可将简书网页端的链接转换成简书 App 端的 URL Scheme，从而实现一键跳转。
    """)
    put_input("url", label="请输入简书 URL：", type=TEXT)
    put_button("转换", onclick=OnConvertButtonClicked)

    SetFooter(config["service_pages_footer"])
