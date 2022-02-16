from config_manager import Config
from JianshuResearchTools.assert_funcs import AssertJianshuUrl
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


def Convert():
    try:
        AssertJianshuUrl(pin["url"])
    except InputError:
        toast("输入的链接无效，请检查", color="error")
        return  # 发生错误，不再运行后续逻辑

    # 为提高性能，概率大的链接类型放在前面
    convert_funcs = (UserUrlToUserUrlScheme, ArticleUrlToArticleUrlScheme,
                     CollectionUrlToCollectionUrlScheme, NotebookUrlToNotebookUrlScheme, )
    for convert_func in convert_funcs:
        try:
            result = convert_func(pin["url"])
        except InputError:
            result = None
        else:
            break

    if not result:
        toast("输入的链接无效，请检查", color="error")
        return  # 发生错误，不再运行后续逻辑

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
    put_input("url", label="简书 URL", type=TEXT)
    put_button("转换", onclick=Convert)

    SetFooter(Config()["service_pages_footer"])