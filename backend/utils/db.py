from motor.motor_asyncio import (
    AsyncIOMotorClient,
)

from utils.config import config

_DB_CLIENT = AsyncIOMotorClient(config.db.host, config.db.port)
_MAIN_DB = _DB_CLIENT[config.db.database]
_JFETCHER_DB = _DB_CLIENT["JFetcherData"]

RUN_LOG_COLLECTION = _MAIN_DB["run_log"]
ARTICLE_FP_RANK_COLLECTION = _JFETCHER_DB["article_FP_rank"]
LOTTERY_COLLECTION = _JFETCHER_DB["lottery_data"]
LP_COLLECTIONS_COLLECTION = _JFETCHER_DB["LP_collections"]
JPEP_FTN_MACKET_COLLECTION = _JFETCHER_DB["JPEP_FTN_macket"]
