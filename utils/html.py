def colored_text(text: str, color: str) -> str:
    return f'<font color="{color}">{text}</font>'


def colored_link(text: str, url: str, color: str, new_window: bool = False) -> str:
    if new_window:
        # 由于新打开的页面拥有对原页面的部分访问权限，这里需要进行处理
        return f'<a href="{url}" style="color: {color}" target="_blank" rel="noopener noreferrer">{text}</a>'
    else:
        return f'<a href="{url}" style="color: {color}" target="_self" >{text}</a>'


def green_text(text, color: str = "#008700") -> str:
    return colored_text(text, color)


def orange_text(text, color: str = "#FF8C00") -> str:
    return colored_text(text, color)


def red_text(text, color: str = "#FF2D10") -> str:
    return colored_text(text, color)


def grey_text(text: str, color: str = "#57606A") -> str:
    return colored_text(text, color)


def link(text: str, url: str, color: str = "#0366d6", new_window: bool = False) -> str:
    return colored_link(text, url, color, new_window)


def orange_link(text: str, url: str, color: str = "#FF8C00", new_window: bool = False) -> str:
    return colored_link(text, url, color, new_window)
