from datetime import datetime
from typing import Literal

from utils.config_manager import config
from utils.db_manager import log_db

LOG_TYPES = {"SYSTEM", "MODULE"}
# 日志等级越大越重要
LEVELS_TO_NUMS = {"DEBUG": 0,
                  "INFO": 1,
                  "WARNING": 2,
                  "ERROR": 3,
                  "CRITICAL": 4
                  }
LEVELS = set(LEVELS_TO_NUMS.keys())


# TODO: 用更优雅的方式实现类型标注
def AddRunLog(type_: Literal["SYSTEM", "MODULE"],
              level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
              content: str) -> None:
    if type_ not in LOG_TYPES:
        raise ValueError(f"指定的日志类型 {type_} 不存在")
    if level not in LEVELS:
        raise ValueError(f"指定的日志等级 {level} 不存在")

    if LEVELS_TO_NUMS[level] < \
       LEVELS_TO_NUMS[config["minimum_record_log_level"]]:
        return  # 小于最小记录等级则不记录

    log_db.insert_one({
        "time": datetime.now(),
        "type": type_,
        "level": level,
        "content": content
    })

    if LEVELS_TO_NUMS[level] >= \
       LEVELS_TO_NUMS[config["minimum_print_log_level"]]:
        # 大于等于最小输出等级，输出日志
        print(f"[{datetime.now().strftime(r'%Y-%m-%d %H:%M:%S')}] "
              f"[{type_}] [{level}] {content}")
