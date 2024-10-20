from litestar import Router

from .articles import ARTICLES_ROUTER
from .jpep import JPEP_ROUTER
from .lottery import LOTTERY_ROUTER
from .status import STATUS_ROUTER
from .thanks import THANKS_ROUTER
from .users import USERS_ROUTER

V1_ROUTER = Router(
    path="/v1",
    route_handlers=[
        ARTICLES_ROUTER,
        JPEP_ROUTER,
        LOTTERY_ROUTER,
        STATUS_ROUTER,
        THANKS_ROUTER,
        USERS_ROUTER,
    ],
)
