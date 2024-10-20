from sshared.logging import Logger

from utils.config import CONFIG

logger = Logger(
    display_level=CONFIG.logging.display_level,
    save_level=CONFIG.logging.save_level,
    connection_string=CONFIG.postgres.logging_connection_string,
    table=CONFIG.logging.table,
)
