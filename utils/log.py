from datetime import datetime
from inspect import currentframe
from os import listdir
from queue import Queue
from threading import Thread
from time import sleep
from typing import Dict, List, Optional

from utils.config import config
from utils.db import access_log_db, run_log_db

RUN_LOG_LEVELS = {
    "DEBUG": 0,
    "INFO": 1,
    "WARNING": 2,
    "ERROR": 3,
    "CRITICAL": 4,
}


def _get_base_dir() -> str:
    """获取应用根目录，用于在日志记录中保存文件名

    该函数将从当前目录开始逐级向上，直到在目录下发现 `main.py` 文件

    Returns:
        str: 应用根目录
    """
    now_dir = __file__.split("/")[:-1]
    while True:
        if "main.py" not in listdir("/".join(now_dir)):
            now_dir.pop()
        else:
            return "/".join(now_dir)


# 获取应用根目录，加入 / 以便替换后的路径中不会出现多余的斜杠
BASE_DIR: str = _get_base_dir() + "/"


def _get_filename() -> Optional[str]:
    try:
        result: str = currentframe().f_back.f_back.f_back.f_code.co_filename
        return result.replace(BASE_DIR, "")
    except AttributeError:
        return None


def _get_line_number() -> Optional[int]:
    try:
        return currentframe().f_back.f_back.f_back.f_lineno
    except AttributeError:
        return None


class RunLogger:
    def __init__(
        self,
        db,
        save_interval: int,
        minimum_record_level: str,
        minimum_print_level: str,
    ) -> None:
        self._db = db
        self._minimum_record_level = minimum_record_level
        self._minimum_print_level = minimum_print_level
        self._save_interval = save_interval
        self._data_queue: Queue = Queue()
        self._save_thread = Thread(target=self._save_to_db)

        self._save_thread.start()

    def _save_to_db(self) -> None:
        while True:
            if not self._data_queue.empty():
                data_to_save: List[Dict] = []
                while not self._data_queue.empty():
                    data_to_save.append(self._data_queue.get())
                self._db.insert_many(data_to_save)
                data_to_save.clear()
            sleep(self._save_interval)

    def force_refresh(self):
        if self._data_queue.empty():  # 没有要保存的数据
            return
        data_to_save: List[Dict] = []
        while not self._data_queue.empty():
            data_to_save.append(self._data_queue.get())
        self._db.insert_many(data_to_save)

    def _log(self, level: str, content: str) -> None:
        if RUN_LOG_LEVELS[level] < RUN_LOG_LEVELS[self._minimum_record_level]:
            return

        file_name: Optional[str] = _get_filename()
        line_number: Optional[int] = _get_line_number()

        self._data_queue.put(
            {
                "time": datetime.now(),
                "file_name": file_name,
                "line": line_number,
                "level": level,
                "content": content,
            }
        )

        if RUN_LOG_LEVELS[level] >= RUN_LOG_LEVELS[self._minimum_print_level]:
            print(
                f"[{datetime.now().strftime(r'%Y-%m-%d %H:%M:%S')}] "
                f"[{file_name}:{line_number}] [{level}] {content}"
            )

    def debug(self, content: str) -> None:
        self._log("DEBUG", content)

    def info(self, content: str) -> None:
        self._log("INFO", content)

    def warning(self, content: str) -> None:
        self._log("WARNING", content)

    def error(self, content: str) -> None:
        self._log("ERROR", content)

    def critical(self, content: str) -> None:
        self._log("CRITICAL", content)


class AccessLogger:
    def __init__(self, db, save_interval: int) -> None:
        self._db = db
        self._save_interval = save_interval
        self._data_queue: Queue = Queue()
        self._save_thread = Thread(target=self._save_to_db)

        self._save_thread.start()

    def log(
        self,
        module: str,
        ua: str,
        ip: str,
        protocol: str,
    ) -> None:
        self._data_queue.put(
            {
                "time": datetime.now(),
                "module": module,
                "ua": ua,
                "ip": ip,
                "protocol": protocol,
            }
        )

    def log_from_info_obj(
        self,
        module_name: str,
        info_obj,
    ) -> None:
        # PyWebIO 使用 Tornado 的 `request.remote_ip` 作为 `info_obj.user_ip` 的值
        # 这在使用反向代理时会出现问题，无法记录客户端的真实 IP
        # 因此，先检查反向代理服务器负责设置的 `X-Forwarded-For` Header，尝试将其作为请求者 IP
        # 如该 Header 不存在，视为没有使用反向代理，回退到记录 `info_obj.user_ip`
        ip = info_obj.request.headers.get("X-Forwarded-For")
        if not ip:
            ip = info_obj.user_ip

        self.log(
            module=module_name,
            ua=info_obj.user_agent.ua_string,
            ip=ip,
            protocol=info_obj.protocol,
        )

    def _save_to_db(self):
        while True:
            if not self._data_queue.empty():
                data_to_save: List[Dict] = []
                while not self._data_queue.empty():
                    data_to_save.append(self._data_queue.get())
                self._db.insert_many(data_to_save)
                data_to_save.clear()
            sleep(self._save_interval)

    def force_refresh(self):
        if self._data_queue.empty():  # 没有要保存的数据
            return
        data_to_save: List[Dict] = []
        while not self._data_queue.empty():
            data_to_save.append(self._data_queue.get())
        self._db.insert_many(data_to_save)


run_logger: RunLogger = RunLogger(
    db=run_log_db,
    save_interval=30,
    minimum_record_level=config.log.minimum_record_level,
    minimum_print_level=config.log.minimum_print_level,
)

access_logger: AccessLogger = AccessLogger(
    db=access_log_db,
    save_interval=120,
)
