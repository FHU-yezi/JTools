import logging
from asyncio import run as asyncio_run

from uvicorn import run as uvicorn_run

from models.debug_project_record import DebugProjectRecord
from models.jianshu.lottery_win_record import LotteryWinRecord
from models.jianshu.user import User
from models.tech_stack import TechStack
from models.tool import Tool
from utils.config import CONFIG
from utils.db import jianshu_pool, jpep_pool, jtools_pool
from utils.log import logger

logging.getLogger("httpx").setLevel(logging.CRITICAL)
logging.getLogger("httpcore").setLevel(logging.CRITICAL)


async def init_db() -> None:
    await jianshu_pool.prepare()
    await jpep_pool.prepare()
    await jtools_pool.prepare()

    await DebugProjectRecord.init()
    await LotteryWinRecord.init()
    await TechStack.init()
    await User.init()
    await Tool.init()


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
