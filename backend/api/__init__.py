from litestar import Router

from .v1 import V1_ROUTER

API_ROUTER = Router(
    path="/api",
    route_handlers=[
        V1_ROUTER,
    ],
)
