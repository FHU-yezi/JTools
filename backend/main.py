import logging
from asyncio import run as asyncio_run

from litestar import Litestar
from litestar.openapi import OpenAPIConfig, OpenAPIController
from litestar.openapi.spec import Server
from sshared.api.uvicorn import get_uvicorn_params_from_config
from sspeedup.api.litestar import EXCEPTION_HANDLERS
from uvicorn import run as uvicorn_run

from api import API_ROUTER
from models import init_db
from utils.config import CONFIG
from utils.log import logger

logging.getLogger("httpx").setLevel(logging.CRITICAL)
logging.getLogger("httpcore").setLevel(logging.CRITICAL)


class CustomOpenAPIController(OpenAPIController):
    path = "/docs"
    swagger_ui_version = "5.17.14"
    swagger_css_url = (
        "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui.css"
    )
    swagger_ui_bundle_js_url = (
        "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"
    )
    swagger_ui_standalone_preset_js_url = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"
    favicon_url = "https://tools.sscreator.com/favicon-vector.svg"


app = Litestar(
    route_handlers=[API_ROUTER],
    exception_handlers=EXCEPTION_HANDLERS,
    openapi_config=OpenAPIConfig(
        openapi_controller=CustomOpenAPIController,
        title="JTools API",
        version="v1.0.0",
        servers=[Server(description="主端点", url="/api")],
        use_handler_docstrings=True,
        root_schema_site="swagger",
        enabled_endpoints={"swagger", "openapi.json"},
    ),
)

if __name__ == "__main__":
    asyncio_run(init_db())
    logger.debug("初始化数据库成功")

    logger.info("启动 API 服务")
    uvicorn_run(
        app="main:app",
        **get_uvicorn_params_from_config(CONFIG.uvicorn),
    )
