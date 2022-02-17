from pywebio.session import eval_js, run_js


def SetFooter(html: str):
    """
    设置底栏内容
    """
    run_js(f"$('footer').html('{html}')")


def GetUrl():
    """
    获取当前 URL
    """
    return eval_js("window.location.href")
