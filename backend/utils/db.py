from motor.motor_asyncio import (
    AsyncIOMotorClient,
)

from utils.config import CONFIG

_CLIENT = AsyncIOMotorClient(CONFIG.mongo.host, CONFIG.mongo.port)
MAIN_DB = _CLIENT[CONFIG.mongo.database]
JIANSHU_DB = _CLIENT.jianshu
JPEP_DB = _CLIENT.jpep
