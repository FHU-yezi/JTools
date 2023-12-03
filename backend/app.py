from litestar import Litestar
from litestar.openapi import OpenAPIConfig, OpenAPIController
from litestar.openapi.spec import Server
from sspeedup.api.litestar import EXCEPTION_HANDLERS

from api import API_ROUTER


class CustomOpenAPIController(OpenAPIController):
    path = "/docs"
    swagger_ui_version = "5.10.3"
    swagger_css_url = (
        "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.3/swagger-ui.css"
    )
    swagger_ui_bundle_js_url = (
        "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"
    )
    swagger_ui_standalone_preset_js_url = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"
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
