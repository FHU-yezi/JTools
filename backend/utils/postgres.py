from asyncio import sleep
from typing import Optional

from psycopg import OperationalError
from psycopg.connection_async import AsyncConnection
from sshared.postgres import enhance_json_process

from utils.config import CONFIG

enhance_json_process()


class _ConnectionManager:
    def __init__(self, connection_string: str) -> None:
        self._connection_string = connection_string
        self._conn: Optional[AsyncConnection] = None
        self._connecting = False

    async def _blocking_connect(self) -> None:
        self._connecting = True

        while True:
            try:
                self._conn = await AsyncConnection.connect(self._connection_string)
                self._connecting = False
                return
            except OperationalError:  # noqa: PERF203
                await sleep(0.1)

    async def _blocking_waiting_for_conn(self) -> AsyncConnection:
        while True:
            if self._conn:
                return self._conn

            await sleep(0.03)

    async def _check(self) -> bool:
        if not self._conn:
            return False

        try:
            await self._conn.execute("")
            return True
        except OperationalError:
            return False

    async def get_conn(self) -> AsyncConnection:
        # 尚未连接
        if not self._conn:
            # 如果正在尝试连接，阻塞等待
            if self._connecting:
                return await self._blocking_waiting_for_conn()

            # 否则，尝试连接并返回
            await self._blocking_connect()
            return self._conn # type: ignore

        # 已连接，检查状态
        ok = await self._check()
        # 如果状态异常，重新连接
        if not ok:
            # 如果正在尝试连接，阻塞等待
            if self._connecting:
                return await self._blocking_waiting_for_conn()

            # 否则，尝试连接
            await self._blocking_connect()

        # 状态正常，返回
        return self._conn  # type: ignore


_jtools_connection_manager = _ConnectionManager(CONFIG.postgres.connection_string)
_jianshu_connection_manager = _ConnectionManager(
    CONFIG.postgres.connection_string.rsplit("/", maxsplit=1)[0] + "/jianshu"
)

get_jtools_conn = _jtools_connection_manager.get_conn
get_jianshu_conn = _jianshu_connection_manager.get_conn
