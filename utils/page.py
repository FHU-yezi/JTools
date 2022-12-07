from pywebio.session import eval_js, info, run_js


def set_footer(html: str) -> None:
    run_js(f"$('footer').html('{html}')")


def get_current_page_url() -> str:
    return eval_js("window.location.href").split("/")[-2]


def get_base_url() -> str:
    return eval_js("window.location.href").split("?")[0][:-1]


def get_chart_width() -> int:
    # 850 为宽度上限
    return min(eval_js("document.body.clientWidth"), 850)


def get_chart_height() -> int:
    return int(get_chart_width() / 1.5)


def is_Android() -> bool:
    # TODO
    return "Android" in str(info.user_agent)
