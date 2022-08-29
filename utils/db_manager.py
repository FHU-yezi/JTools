from pymongo import MongoClient

from config_manager import config


def init_DB():
    connection: MongoClient = MongoClient(config["db_address"],
                                          config["db_port"])
    db = connection.JMFData
    return db


db = init_DB()

log_db = db.log
