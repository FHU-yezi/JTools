from litestar import Router

from api.v1.articles import ARTICLES_ROUTER
from api.v1.lottery import LOTTERY_ROUTER
from api.v1.status import STATUS_ROUTER
from api.v1.users import USERS_ROUTER

V1_ROUTER = Router(
    path="/v1",
    route_handlers=[
        ARTICLES_ROUTER,
        LOTTERY_ROUTER,
        STATUS_ROUTER,
        USERS_ROUTER,
    ],
)
