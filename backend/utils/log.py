from sspeedup.logging.run_logger import RunLogger

from utils.config import config
from utils.db import RUN_LOG_COLLECTION

logger = RunLogger(
    save_level=config.log.save_level,
    print_level=config.log.print_level,
    mongo_collection=RUN_LOG_COLLECTION,
)
