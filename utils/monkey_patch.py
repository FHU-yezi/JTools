from typing import Callable


def patch_add_html_name_desc(func: Callable, name: str, desc: str) -> Callable:
    doc = f"""{name}

    {desc}
    """

    func.__doc__ = doc
    return func


def patch_add_page_name_desc(func: Callable, name: str, desc: str) -> Callable:
    func_name = func.__name__
    func_doc = func.__doc__

    def footer_patched() -> None:
        from pywebio.output import put_markdown
        put_markdown(f"""
        # {name}

        {desc}
        """)

        func()

    footer_patched.__name__ = func_name
    footer_patched.__doc__ = func_doc

    return footer_patched


def patch_add_footer(func: Callable, text: str) -> Callable:
    func_name = func.__name__
    func_doc = func.__doc__

    def footer_patched() -> None:
        func()

        from utils.page_helper import set_footer
        set_footer(text)

    footer_patched.__name__ = func_name
    footer_patched.__doc__ = func_doc

    return footer_patched
