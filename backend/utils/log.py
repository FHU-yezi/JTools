from pymongo import MongoClient
from sshared.logging import Logger

from utils.config import config

_client = MongoClient()

logger = Logger(
    # TODO
    save_level=config.log.save_level.value, # type: ignore
    display_level=config.log.print_level.value, # type: ignore
    save_collection=_client[config.db.database].log,
)
