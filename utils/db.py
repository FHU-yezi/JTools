from pymongo import MongoClient, IndexModel

from utils.config import config


def init_DB(db_name: str):
    connection: MongoClient = MongoClient(config.db.host, config.db.port)
    db = connection[db_name]
    return db


db = init_DB(config.db.main_database)

run_log_db = db.run_log
access_log_db = db.access_log

_jfetcher_data_db = init_DB("JFetcherData")
article_FP_rank_db = _jfetcher_data_db.article_FP_rank
lottery_db = _jfetcher_data_db.lottery_db
LP_collections_db = _jfetcher_data_db.LP_collections

# 创建索引

article_FP_rank_db.create_indexes([
    IndexModel([("date", 1)]),
    IndexModel([("ranking", 1)])
])
lottery_db.create_indexes([
    IndexModel([("time", 1)]),
    IndexModel([("reward_name", 1)]),
])
LP_collections_db.create_indexes([
    IndexModel([("fetch_date", 1)]),
    IndexModel([("article.id", 1)]),
])
