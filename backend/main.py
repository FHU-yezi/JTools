import logging

from uvicorn import run as uvicorn_run

from utils.config import config
from utils.log import logger

logging.getLogger("httpx").setLevel(logging.CRITICAL)
logging.getLogger("httpcore").setLevel(logging.CRITICAL)

if __name__ == "__main__":
    logger.info("启动 API 服务")
    uvicorn_run(
        app="app:app",
        host=config.deploy.host,
        port=config.deploy.port,
        log_level=config.deploy.uvicorn_log_level,
        workers=config.deploy.workers,
        reload=config.deploy.reload,
        access_log=config.deploy.access_log,
    )
