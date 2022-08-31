from datetime import datetime
from typing import Sequence

from utils.config_manager import config
from utils.db_manager import access_log_db, run_log_db

LOG_LEVELS = {
    "DEBUG": 0,
    "INFO": 1,
    "WARNING": 2,
    "ERROR": 3,
    "CRITICAL": 4
}


class RunLogger():
    def __init__(self, db, log_types: Sequence[str], minimum_record_level: str,
                 minimum_print_level: str) -> None:
        self._db = db
        self._log_types = log_types
        self._minimum_record_level = minimum_record_level
        self._minimum_print_level = minimum_print_level

    def _log(self, level: str, type_: str, content: str) -> None:
        if type_ not in self._log_types:
            raise ValueError(f"指定的日志类型 {type_} 不存在")
        if level not in LOG_LEVELS:
            raise ValueError(f"指定的日志等级 {level} 不存在")

        if LOG_LEVELS[level] < LOG_LEVELS[self._minimum_record_level]:
            return

        self._db.insert_one({
            "time": datetime.now(),
            "type": type_,
            "level": level,
            "content": content
        })

        if LOG_LEVELS[level] >= LOG_LEVELS[self._minimum_print_level]:
            print(f"[{datetime.now().strftime(r'%Y-%m-%d %H:%M:%S')}] "
                  f"[{type_}] [{level}] {content}")

    def debug(self, type_: str, content: str) -> None:
        self._log("DEBUG", type_, content)

    def info(self, type_: str, content: str) -> None:
        self._log("INFO", type_, content)

    def warning(self, type_: str, content: str) -> None:
        self._log("WARNING", type_, content)

    def error(self, type_: str, content: str) -> None:
        self._log("ERROR", type_, content)

    def critical(self, type_: str, content: str) -> None:
        self._log("CRITICAL", type_, content)


class AccessLogger():
    def __init__(self, db) -> None:
        self._db = db

    def log(self, module: str, ua: str, ip: str, protocol: str) -> None:
        self._db.insert_one({
            "time": datetime.now(),
            "module": module,
            "ua": ua,
            "ip": ip,
            "protocol": protocol
        })

    def log_from_info_obj(self, module_name: str, info_obj) -> None:
        self.log(
            module=module_name,
            ua=info_obj.user_agent.ua_string,
            ip=info_obj.user_ip,
            protocol=info_obj.protocol
        )


run_logger: RunLogger = RunLogger(
    db=run_log_db,
    log_types=("SYSTEM", ),
    minimum_record_level=config.log.minimum_record_level,
    minimum_print_level=config.log.minimum_print_level
)
access_logger: AccessLogger = AccessLogger(
    db=access_log_db
)
