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


def can_use_URL_Scheme() -> bool:
    ua: str = str(info.user_agent)

    return any(item in ua for item in URL_SCHEME_ALLOW_LIST)


def apply_better_tabs() -> None:
    run_js('$("label").map(function(_, x) {console.log(x.style = "flex-grow:1; text-align: center")})')
