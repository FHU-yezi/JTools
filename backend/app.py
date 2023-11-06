from litestar import Litestar
from litestar.openapi import OpenAPIConfig
from litestar.openapi.spec import Server
from sspeedup.api.litestar import EXCEPTION_HANDLERS

from api import API_ROUTER

app = Litestar(
    route_handlers=[API_ROUTER],
    exception_handlers=EXCEPTION_HANDLERS,
    openapi_config=OpenAPIConfig(
        title="JTools API",
        version="v1.0.0",
        servers=[Server(description="主端点", url="/")],
        use_handler_docstrings=True,
        root_schema_site="elements",
        enabled_endpoints={"elements", "openapi.json"},
    ),
)
