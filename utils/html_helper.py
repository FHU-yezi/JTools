def link_HTML(text: str, url: str, color: str = "#0366d6") -> str:
    return f'<a href="{url}" style="color: {color}">{text}</a>'


def colored_text_HTML(text: str, color: str) -> str:
    return f'<font color="{color}">{text}</font>'
