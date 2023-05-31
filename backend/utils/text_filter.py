from typing import Set

BANNED_CHARS: Set[str] = {
    " ",
    "\\",
    ";",
    "^",
    "$",
}


def has_banned_chars(text: str) -> bool:
    return any(char in BANNED_CHARS for char in text)


def input_filter(text: str) -> str:
    for char in BANNED_CHARS:
        text = text.replace(char, "")
    return text
