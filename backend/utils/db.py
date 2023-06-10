from pymongo import IndexModel, MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

from utils.config import config


def init_db(db_name: str) -> Database:
    connection: MongoClient = MongoClient(config.db.host, config.db.port)
    return connection[db_name]


db = init_db(config.db.main_database)


def get_collection(collection_name: str) -> Collection:
    return db[collection_name]


run_log_db = db.run_log

_jfetcher_data_db = init_db("JFetcherData")
article_fp_rank_db = _jfetcher_data_db.article_FP_rank
lottery_db = _jfetcher_data_db.lottery_data
LP_collections_db = _jfetcher_data_db.LP_collections
JPEP_FTN_market_db = _jfetcher_data_db.JPEP_FTN_macket

# 创建索引

article_fp_rank_db.create_indexes(
    [
        IndexModel([("date", 1)]),
        IndexModel([("ranking", 1)]),
    ]
)
lottery_db.create_indexes(
    [
        IndexModel([("time", 1)]),
        IndexModel([("reward_name", 1)]),
    ]
)
LP_collections_db.create_indexes(
    [
        IndexModel([("fetch_date", 1)]),
        IndexModel([("article.id", 1)]),
    ]
)
JPEP_FTN_market_db.create_indexes(
    [
        IndexModel([("fetch_time", 1)]),
    ]
)
