import logging
from asyncio import run as asyncio_run

from uvicorn import run as uvicorn_run

from models import init_db
from utils.config import CONFIG
from utils.log import logger

logging.getLogger("httpx").setLevel(logging.CRITICAL)
logging.getLogger("httpcore").setLevel(logging.CRITICAL)


if __name__ == "__main__":
    asyncio_run(init_db())
    logger.debug("初始化数据库成功")

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
