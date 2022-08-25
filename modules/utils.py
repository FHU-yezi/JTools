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
    return eval_js("window.location.href").split("/")[0]


def TimeDeltaFormat(td_object):
    seconds = int(td_object.total_seconds())
    periods = (
        ("年", 60 * 60 * 24 * 365),
        ("月", 60 * 60 * 24 * 30),
        ("天", 60 * 60 * 24),
        ("小时", 60 * 60),
        ("分钟", 60),
        ("秒", 1)
    )

    strings = []
    for period_name, period_seconds in periods:
        if seconds > period_seconds:
            period_value, seconds = divmod(seconds, period_seconds)
            strings.append(f"{period_value} {period_name}")

    return " ".join(strings)
