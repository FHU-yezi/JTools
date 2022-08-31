from qrcode import make


def make_qrcode(text: str):
    return make(text)._img
