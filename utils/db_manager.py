from pymongo import MongoClient

from utils.config_manager import config


def init_DB():
    connection: MongoClient = MongoClient(config.db.host, config.db.port)
    db = connection[config.db.main_database]
    return db


db = init_DB()

log_db = db.log
