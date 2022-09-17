from pymongo import MongoClient

from utils.config import config


def init_DB(db_name: str):
    connection: MongoClient = MongoClient(config.db.host, config.db.port)
    db = connection[db_name]
    return db


db = init_DB(config.db.main_database)

run_log_db = db.run_log
access_log_db = db.access_log

article_FP_rank_db = init_DB("JFetcherData").article_FP_rank
lottery_db = init_DB("JFetcherData").lottery_data
