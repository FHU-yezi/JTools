from motor.motor_asyncio import (
    AsyncIOMotorClient,
)

from utils.config import config

_CLIENT = AsyncIOMotorClient(config.db.host, config.db.port)
MAIN_DB = _CLIENT[config.db.database]
_JFETCHER_DB = _CLIENT["JFetcherData"]

RUN_LOG_COLLECTION = MAIN_DB["run_log"]
ARTICLE_FP_RANK_COLLECTION = _JFETCHER_DB["article_FP_rank"]
LOTTERY_COLLECTION = _JFETCHER_DB["lottery_data"]
LP_COLLECTIONS_COLLECTION = _JFETCHER_DB["LP_collections"]
JPEP_FTN_MACKET_COLLECTION = _JFETCHER_DB["JPEP_FTN_macket"]
