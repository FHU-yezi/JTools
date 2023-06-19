from datetime import datetime, timedelta
from typing import Optional


def get_data_start_time(td: Optional[timedelta] = None) -> datetime:
    """根据当前时间获取数据起始时间，当参数 td 为 None 时返回 1970-1-1，代表全部数据

    Args:
        td (Optional[timedelta], optional): 与现在的时间差. Defaults to None.

    Returns:
        datetime: 数据起始时间
    """
    return (
        datetime.now() - td
        if td
        else datetime(
            year=1970,
            month=1,
            day=1,
        )
    )
