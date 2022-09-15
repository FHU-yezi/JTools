from typing import Callable
from functools import wraps


def patch_add_html_name_desc(func: Callable[[], None], name: str, desc: str) -> Callable[[], None]:
    doc = f"""{name}

    {desc}
    """

    func.__doc__ = doc
    return func


def patch_add_page_name_desc(func: Callable[[], None], name: str, desc: str) -> Callable[[], None]:
    @wraps(func)
    def footer_patched() -> None:
        from pywebio.output import put_markdown
        put_markdown(f"""
        # {name}

        {desc}
        """)

        func()

    return footer_patched


def patch_add_footer(func: Callable[[], None], text: str) -> Callable[[], None]:
    @wraps(func)
    def footer_patched() -> None:
        func()

        from utils.page_helper import set_footer
        set_footer(text)

    return footer_patched


def patch_record_access(func: Callable[[], None], page_func_name: str) -> Callable[[], None]:
    @wraps(func)
    def log_record_patched() -> None:
        from pywebio.session import info
        from utils.log_manager import access_logger

        access_logger.log_from_info_obj(page_func_name, info)

        func()

    return log_record_patched
