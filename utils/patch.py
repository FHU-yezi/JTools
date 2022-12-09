from functools import wraps
from typing import Callable, List

from utils.config import config
from utils.module_finder import Module


def patch_add_html_name_desc(
    func: Callable[[], None], module_obj: Module
) -> Callable[[], None]:
    doc = f"""{module_obj.page_name}

        {module_obj.page_desc}
        """

    func.__doc__ = doc
    return func


def patch_add_page_name_desc(
    func: Callable[[], None], module_obj: Module
) -> Callable[[], None]:
    @wraps(func)
    def footer_patched() -> None:
        from pywebio.output import put_markdown

        put_markdown(
            f"""
            # {module_obj.page_name}

            {module_obj.page_desc}
            """
        )

        func()

    return footer_patched


def patch_add_footer(
    func: Callable[[], None], module_obj: Module
) -> Callable[[], None]:
    @wraps(func)
    def footer_patched() -> None:
        func()

        from utils.page import set_footer

        set_footer(config.footer)

    return footer_patched


def patch_record_access(
    func: Callable[[], None], module_obj: Module
) -> Callable[[], None]:
    @wraps(func)
    def log_record_patched() -> None:
        from pywebio.session import info

        from utils.log import access_logger

        access_logger.log_from_info_obj(module_obj.module_name, info)

        func()

    return log_record_patched


PATCH_FUNCS: List[Callable] = [
    obj for name, obj in globals().items() if name.startswith("patch")
]


def patch_all(module: Module) -> Module:
    for patch_func in PATCH_FUNCS:
        module.page_func = patch_func(module.page_func, module)
    return module
