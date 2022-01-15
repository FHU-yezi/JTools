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
from pywebio import pin
from pywebio.input import TEXT
from pywebio.output import (put_button, put_image, put_link, put_markdown,
                            toast, use_scope)
from qrcode import make as make_qrcode

from .utils import LinkInHTML, SetFooter


def CheckData():
    try:
        AssertJianshuUrl(pin.pin["url"])
    except InputError:
        toast("输入的链接无效，请检查", color="error")
        return False

    error_count = 0
    assert_funcs = (AssertUserUrl, AssertArticleUrl, AssertCollectionUrl, AssertNotebookUrl)
    for assert_func in assert_funcs:
        try:
            assert_func(pin.pin["url"])
        except InputError:
            error_count += 1
    if error_count != len(assert_funcs) - 1:
        toast("输入的链接无效，请检查", color="error")
        return False
    return True


def Convert():
    if not CheckData():
        return  # 发生错误，不再运行后续逻辑
    with use_scope("output", if_exist="remove"):
        convert_funcs = (ArticleUrlToArticleUrlScheme, CollectionUrlToCollectionUrlScheme,
                         NotebookUrlToNotebookUrlScheme, UserUrlToUserUrlScheme)
        for convert_func in convert_funcs:
            try:
                result = convert_func(pin.pin["url"])
            except InputError:
                continue
            else:
                break

        put_markdown("---")  # 分割线

        put_markdown("**转换结果**：")
        put_link(name=result, url=result)

        img = make_qrcode(result)._img
        put_image(img)


def URLSchemeConverter():
    """简书小工具集：URL Scheme 转换工具"""

    put_markdown("""
    # URL Scheme 转换工具

    本工具可将简书网页端的链接转换成简书 App 端的 URL Scheme，从而实现一键跳转。
    """, lstrip=True)
    pin.put_input("url", label="网页端 URL", type=TEXT)
    put_button("转换", onclick=Convert)

    SetFooter(f"Powered By \
              {LinkInHTML('JRT', 'https://github.com/FHU-yezi/JianshuResearchTools/')} \
              and {LinkInHTML('PyWebIO', 'https://github.com/pywebio/PyWebIO')}")
