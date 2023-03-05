from datetime import datetime
from queue import Queue
from threading import Thread
from time import sleep
from typing import Dict, List

from pymongo.collection import Collection
from pywebio.session import _SessionInfoType
from sspeedup.logging.run_logger import LogLevel, RunLogger

from utils.config import config
from utils.db import access_log_db, run_log_db


class AccessLogger:
    def __init__(self, db: Collection, save_interval: int) -> None:
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
        info_obj: _SessionInfoType,
    ) -> None:
        # PyWebIO 使用 Tornado 的 `request.remote_ip` 作为 `info_obj.user_ip` 的值
        # 这在使用反向代理时会出现问题，无法记录客户端的真实 IP
        # 因此，先检查反向代理服务器负责设置的 `X-Forwarded-For` Header，尝试将其作为请求者 IP
        # 如该 Header 不存在，视为没有使用反向代理，回退到记录 `info_obj.user_ip`
        ip = info_obj.request.headers.get("X-Forwarded-For")  # type: ignore
        if not ip:
            ip = info_obj.user_ip

        self.log(
            module=module_name,
            ua=info_obj.user_agent.ua_string,
            ip=ip,
            protocol=info_obj.protocol,
        )

    def _save_to_db(self) -> None:
        while True:
            if not self._data_queue.empty():
                data_to_save: List[Dict] = []
                while not self._data_queue.empty():
                    data_to_save.append(self._data_queue.get())
                self._db.insert_many(data_to_save)
                data_to_save.clear()
            sleep(self._save_interval)

    def force_refresh(self) -> None:
        if self._data_queue.empty():  # 没有要保存的数据
            return
        data_to_save: List[Dict] = []
        while not self._data_queue.empty():
            data_to_save.append(self._data_queue.get())
        self._db.insert_many(data_to_save)


run_logger = RunLogger(
    mongo_collection=run_log_db,
    print_level=LogLevel[config.log.minimum_print_level],
    save_level=LogLevel[config.log.minimum_record_level],
)

access_logger: AccessLogger = AccessLogger(
    db=access_log_db,
    save_interval=120,
)
