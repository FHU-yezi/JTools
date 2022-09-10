from typing import Set

BANNED_CHARS: Set[str] = {
    " ",
    "\\",
    ":",
    ";",
    "$",
    "^",
}


def user_input_filter(text: str) -> str:
    for char in BANNED_CHARS:
        text = text.replace(char, "")
    return text
