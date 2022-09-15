from functools import partial
from typing import Callable, NoReturn

from pywebio.output import put_loading, toast


def toast_warn_and_return(text: str) -> NoReturn:
    toast(text, color="warn")
    exit()


def toast_error_and_return(text: str) -> NoReturn:
    toast(text, color="error")
    exit()


green_loading: Callable = partial(put_loading, color="success")
