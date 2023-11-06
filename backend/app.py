from litestar import Litestar
from litestar.openapi import OpenAPIConfig
from sspeedup.api.litestar import EXCEPTION_HANDLERS

from api import API_ROUTER

app = Litestar(
    route_handlers=[API_ROUTER],
    exception_handlers=EXCEPTION_HANDLERS,
    openapi_config=OpenAPIConfig(
        title="JTools API",
        version="v1.0.0",
    ),
)
