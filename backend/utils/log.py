from sspeedup.logging.run_logger import LogLevel, RunLogger

from utils.config import config
from utils.db import run_log_db

run_logger: RunLogger = RunLogger(
    mongo_collection=run_log_db,
    save_level=LogLevel[config.log.minimum_save_level],
    print_level=LogLevel[config.log.minimum_print_level],
)
