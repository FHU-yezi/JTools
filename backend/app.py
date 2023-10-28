from litestar import Litestar
from sspeedup.api.litestar import EXCEPTION_HANDLERS

from api import API_ROUTER

app = Litestar(
    route_handlers=[API_ROUTER],
    exception_handlers=EXCEPTION_HANDLERS,
)
