def colored_text_HTML(text: str, color: str) -> str:
    return f'<font color="{color}">{text}</font>'


def colored_link_HTML(text: str, url: str, color: str) -> str:
    return f'<a href="{url}" style="color: {color}">{text}</a>'


def green_text_HTML(text, color: str = "#008700") -> str:
    return colored_text_HTML(text, color)


def orange_text_HTML(text, color: str = "#FF8C00") -> str:
    return colored_text_HTML(text, color)


def red_text_HTML(text, color: str = "#FF2D10") -> str:
    return colored_text_HTML(text, color)


def grey_text_HTML(text: str,  color: str = "#57606A") -> str:
    return colored_text_HTML(text, color)


def link_HTML(text: str, url: str, color: str = "#0366d6") -> str:
    return colored_link_HTML(text, url, color)


def orange_link_HTML(text: str, url: str, color: str = "#FF8C00") -> str:
    return colored_link_HTML(text, url, color)
