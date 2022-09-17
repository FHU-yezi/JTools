from typing import Set

BANNED_CHARS: Set[str] = {
    " ",
    "\\",
    ";",
    "^",
    "$",
}


def has_banned_chars(text: str) -> bool:
    for char in text:
        if char in BANNED_CHARS:
            return True

    return False


def input_filter(text: str) -> str:
    for char in BANNED_CHARS:
        text = text.replace(char, "")
    return text
