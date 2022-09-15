from pywebio.output import toast
from typing import NoReturn


def toast_warn_and_return(text: str) -> NoReturn:
    toast(text, color="warn")
    exit()


def toast_error_and_return(text: str) -> NoReturn:
    toast(text, color="error")
    exit()
