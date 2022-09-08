from datetime import timedelta
from typing import List, Tuple


def human_readable_td(td_obj: timedelta) -> str:
    PERIODS: List[Tuple[str, int]] = [
        ("年", 60 * 60 * 24 * 365),
        ("月", 60 * 60 * 24 * 30),
        ("天", 60 * 60 * 24),
    ]

    total_seconds: int = int(td_obj.total_seconds())

    if total_seconds == 0:
        return "现在"

    if total_seconds < 60 * 60 * 24:  # 时间差小于一天
        return "不到一天"

    string: List[str] = []
    for period_name, period_seconds in PERIODS:
        if total_seconds >= period_seconds:
            period_value, total_seconds = divmod(total_seconds, period_seconds)
            string.append(f"{period_value} {period_name}")

    return " ".join(string)
