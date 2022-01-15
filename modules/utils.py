from pywebio.session import run_js


def LinkInHTML(name: str, link: str):
    """
    获取 HTML 格式的链接
    """
    return f'<a href="{link}" style="color: #0056B3">{name}</a>'


def SetFooter(html: str):
    """
    设置底栏内容
    """
    run_js(f"$('footer').html('{html}')")
