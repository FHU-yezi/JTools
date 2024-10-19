from asyncio import run as asyncio_run

from psycopg.connection_async import AsyncConnection
from sshared.postgres import enhance_json_process

from utils.config import CONFIG

enhance_json_process()


conn = asyncio_run(
    AsyncConnection.connect(
        CONFIG.postgres.connection_string,
        autocommit=True,
    )
)
