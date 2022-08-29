from typing import Callable


def patch_add_module_name_desc(func: Callable, name: str, desc: str) -> Callable:
    doc = f"""{name}

    {desc}
    """

    func.__doc__ = doc
    return func


def patch_add_footer(func: Callable, text: str) -> Callable:
    name = func.__name__
    doc = func.__doc__

    def footer_patched() -> None:
        func()

        from utils.page_helper import set_footer
        set_footer(text)

    footer_patched.__name__ = name
    footer_patched.__doc__ = doc

    return footer_patched
