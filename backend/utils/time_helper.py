from datetime import datetime, timedelta

from sspeedup.time_helper import get_now_without_mileseconds


def get_expire_time(expire_hours: int, buffer: int) -> datetime:
    return get_now_without_mileseconds() + timedelta(hours=expire_hours, minutes=buffer)


def get_fetch_hours(interval: int) -> str:
    result = ["0"]
    last_hour = 0
    while True:
        last_hour += interval
        if last_hour >= 24:
            break
        result.append(str(last_hour))

    return ",".join(result)
