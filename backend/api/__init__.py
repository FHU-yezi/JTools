from litestar import Router

from api.v1 import v1_router

api_router = Router(
    path="/api",
    route_handlers=[
        v1_router,
    ],
)
