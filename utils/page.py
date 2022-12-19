from pywebio.session import eval_js, info, run_js
from typing import Set

URL_SCHEME_ALLOW_LIST: Set = {"Android", "iPhone", "iPad"}


def set_footer(html: str) -> None:
    run_js(f"$('footer').html('{html}')")


def get_base_url() -> str:
    return eval_js(
        'window.location.href.split("?")[0]'
        '.replace(window.pathname != "/" ? window.pathname : "", "")'
    )


def get_chart_width(in_tab: bool = False) -> int:
    # 880 为宽度上限
    result: int = min(eval_js("document.body.clientWidth"), 880)
    # Tab 两侧边距共 47
    if in_tab:
        result -= 47
    return result


def get_chart_height() -> int:
    return int(get_chart_width() / 1.5)


def can_use_URL_Scheme() -> bool:
    ua: str = str(info.user_agent)

    for item in URL_SCHEME_ALLOW_LIST:
        if item in ua:
            return True

    return False
