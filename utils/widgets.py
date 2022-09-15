from functools import partial
from typing import Callable, NoReturn

from pywebio.output import put_loading, toast, use_scope


def toast_warn_and_return(text: str) -> NoReturn:
    toast(text, color="warn")
    exit()


def toast_error_and_return(text: str) -> NoReturn:
    toast(text, color="error")
    exit()


green_loading: Callable = partial(put_loading, color="success")
use_result_scope: Callable = partial(use_scope, "result", clear=True)
