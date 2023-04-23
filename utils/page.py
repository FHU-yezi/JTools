from typing import Set

from pywebio.session import info

URL_SCHEME_ALLOW_LIST: Set = {"Android", "iPhone", "iPad"}


def can_use_url_scheme() -> bool:
    ua: str = str(info.user_agent)

    return any(item in ua for item in URL_SCHEME_ALLOW_LIST)
