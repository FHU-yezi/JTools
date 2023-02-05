from typing import Any

from qrcode import make


def make_qrcode(text: str) -> Any:
    return make(text)._img
