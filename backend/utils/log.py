from pymongo import MongoClient
from sshared.logging import Logger

from utils.config import CONFIG

_client = MongoClient()

logger = Logger(
    display_level=CONFIG.logging.display_level,
    save_level=CONFIG.logging.save_level,
    save_collection=_client[CONFIG.mongo.database].log,
)
