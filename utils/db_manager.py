from pymongo import MongoClient

from utils.config_manager import config


def init_DB():
    connection: MongoClient = MongoClient(config.db.host, config.db.port)
    db = connection[config.db.main_database]
    return db


db = init_DB()

run_log_db = db.run_log
access_log_db = db.access_log
