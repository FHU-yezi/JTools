import logging

from uvicorn import run as uvicorn_run

from utils.config import CONFIG
from utils.log import logger

logging.getLogger("httpx").setLevel(logging.CRITICAL)
logging.getLogger("httpcore").setLevel(logging.CRITICAL)

if __name__ == "__main__":
    logger.info("启动 API 服务")
    uvicorn_run(
        app="app:app",
        host=CONFIG.uvicorn.host,
        port=CONFIG.uvicorn.port,
        log_level=CONFIG.uvicorn.log_level,
        workers=CONFIG.uvicorn.workers,
        reload=CONFIG.uvicorn.reload,
        access_log=CONFIG.uvicorn.access_log,
    )
