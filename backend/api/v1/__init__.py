from litestar import Router

from api.v1.status import STATUS_ROUTER

v1_router = Router(
    path="/v1",
    route_handlers=[
        STATUS_ROUTER,
    ],
)
