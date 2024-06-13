from motor.motor_asyncio import (
    AsyncIOMotorClient,
)

from utils.config import config

_CLIENT = AsyncIOMotorClient(config.db.host, config.db.port)
MAIN_DB = _CLIENT[config.db.database]
JIANSHU_DB = _CLIENT.jianshu
JPEP_DB = _CLIENT.jpep
