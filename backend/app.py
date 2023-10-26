from litestar import Litestar
from sspeedup.api.litestar import EXCEPTION_HANDLERS

from api import api_router

app = Litestar(
    route_handlers=[api_router],
    exception_handlers=EXCEPTION_HANDLERS,
)
