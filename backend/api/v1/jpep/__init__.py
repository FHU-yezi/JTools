from litestar import Router

from .ftn_macket import FTN_MACKET_ROUTER

JPEP_ROUTER = Router(
    path="/jpep",
    route_handlers=[FTN_MACKET_ROUTER],
)
