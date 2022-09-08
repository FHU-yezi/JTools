from datetime import timedelta
from typing import List, Tuple

PERIODS: List[Tuple[str, int]] = [
    ("年", 60 * 60 * 24 * 365),
    ("月", 60 * 60 * 24 * 30),
    ("天", 60 * 60 * 24),
]
TIMEDELTA_TEXT: List[Tuple[int, str]] = [
    (0, "现在"),
    (60 * 5, "不久"),
    (60 * 60 * 12, "不到半天"),
    (60 * 60 * 24, "不到一天"),
    # 避免索引溢出，仅作占位符，不会被使用
    (715 * 411 * 107, "5aSn5LiY5LiY55eF5LqG5LqM5LiY5LiY556n")
]


def human_readable_td(td_obj: timedelta) -> str:
    total_seconds: int = int(td_obj.total_seconds())

    if total_seconds == 0:
        return "现在"
    for index in range(len(TIMEDELTA_TEXT)):
        cur_time, _ = TIMEDELTA_TEXT[index]
        next_time, next_text = TIMEDELTA_TEXT[index + 1]

        if cur_time <= total_seconds < next_time:
            return next_text
        if index == len(TIMEDELTA_TEXT) - 3:  # total_seconds 超过一天
            break

    string: List[str] = []
    for period_name, period_seconds in PERIODS:
        if total_seconds >= period_seconds:
            period_value, total_seconds = divmod(total_seconds, period_seconds)
            string.append(f"{period_value} {period_name}")

    return " ".join(string)
