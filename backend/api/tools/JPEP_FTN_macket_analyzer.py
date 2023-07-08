from datetime import datetime, timedelta  # noqa: N999
from typing import Dict, Literal

from httpx import Client
from sanic import Blueprint, HTTPResponse, Request
from sspeedup.api import CODE, sanic_response_json
from sspeedup.cache.timeout import timeout_cache

from utils.db import JPEP_FTN_market_db
from utils.inject_data_model import inject_data_model_from_query_args
from utils.pydantic_base import BaseModel
from utils.time_helper import get_data_start_time

TEXT_TO_TIMEDELTA: Dict[str, timedelta] = {
    "24h": timedelta(hours=24),
    "7d": timedelta(days=7),
    "15d": timedelta(days=15),
    "30d": timedelta(days=30),
}

HTTP_CLIENT = Client()

JPEP_FTN_market_analyzer_blueprint = Blueprint(
    "JPEP_FTN_market_analyzer", url_prefix="/JPEP_FTN_market_analyzer"
)


@timeout_cache(60)
def get_data_update_time() -> datetime:
    return (
        JPEP_FTN_market_db.find(
            {},
            {
                "_id": 0,
                "fetch_time": 1,
            },
        )
        .sort("fetch_time", -1)
        .limit(1)
        .next()["fetch_time"]
    )


def get_price(type_: Literal["buy", "sell"], time: datetime) -> float:
    try:
        return (
            JPEP_FTN_market_db.find({"fetch_time": time, "trade_type": type_})
            .sort("price", 1 if type_ == "buy" else -1)
            .limit(1)
            .next()["price"]
        )
    except StopIteration:  # 该侧没有挂单
        return 0.0


def get_pool_amount(type_: Literal["buy", "sell"], time: datetime) -> int:
    try:
        return JPEP_FTN_market_db.aggregate(
            [
                {
                    "$match": {
                        "fetch_time": time,
                        "trade_type": type_,
                    }
                },
                {
                    "$group": {
                        "_id": None,
                        "sum": {
                            "$sum": "$amount.tradable",
                        },
                    },
                },
            ]
        ).next()["sum"]
    except StopIteration:  # 该侧没有挂单
        return 0


def get_price_trend_data(
    type_: Literal["buy", "sell"], td: timedelta
) -> Dict[str, float]:
    unit = "hour" if td <= timedelta(days=1) else "day"

    db_result = JPEP_FTN_market_db.aggregate(
        [
            {
                "$match": {
                    "fetch_time": {
                        "$gte": get_data_start_time(td),
                    },
                    "trade_type": type_,
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateTrunc": {
                            "date": "$fetch_time",
                            "unit": unit,
                        },
                    },
                    "price": {
                        "$min" if type_ == "buy" else "$max": "$price",
                    },
                }
            },
            {
                "$sort": {
                    "_id": 1,
                },
            },
        ]
    )

    if unit == "hour":
        return {
            item["_id"].strftime(r"%m-%d %I:%M"): item["price"] for item in db_result
        }

    return {item["_id"].strftime(r"%m-%d"): item["price"] for item in db_result}


def get_pool_amount_trend_data(
    type_: Literal["buy", "sell"], td: timedelta
) -> Dict[str, float]:
    unit = "hour" if td <= timedelta(days=1) else "day"

    db_result = JPEP_FTN_market_db.aggregate(
        [
            {
                "$match": {
                    "trade_type": type_,
                    "fetch_time": {
                        "$gte": get_data_start_time(td),
                    },
                },
            },
            {
                "$group": {
                    "_id": "$fetch_time",
                    "amount": {
                        "$sum": "$amount.tradable",
                    },
                },
            },
            {
                "$group": {
                    "_id": {
                        "$dateTrunc": {
                            "date": "$_id",
                            "unit": "hour",
                        },
                    },
                    "amount": {
                        "$avg": "$amount",
                    },
                },
            },
            {
                "$sort": {
                    "_id": 1,
                },
            },
        ]
    )

    if unit == "hour":
        return {
            item["_id"].strftime(r"%m-%d %I:%M"): round(item["amount"])
            for item in db_result
        }

    return {
        item["_id"].strftime(r"%m-%d"): round(item["amount"], 2) for item in db_result
    }


class DataUpdateTimeResponse(BaseModel):
    data_update_time: int


@JPEP_FTN_market_analyzer_blueprint.get("/data_update_time")
def data_update_time_handler(request: Request) -> HTTPResponse:
    del request

    data_update_time = get_data_update_time()

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=DataUpdateTimeResponse(
            data_update_time=int(data_update_time.timestamp())
        ).model_dump(),
    )


class PriceResponse(BaseModel):
    buy_price: float
    sell_price: float


@JPEP_FTN_market_analyzer_blueprint.get("/price")
def price_handler(request: Request) -> HTTPResponse:
    del request

    data_update_time = get_data_update_time()

    buy_price = get_price("buy", data_update_time)
    sell_price = get_price("sell", data_update_time)

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=PriceResponse(buy_price=buy_price, sell_price=sell_price).model_dump(),
    )


class PoolAmountResponse(BaseModel):
    buy_amount: int
    sell_amount: int


@JPEP_FTN_market_analyzer_blueprint.get("/pool_amount")
def pool_amount_handler(request: Request) -> HTTPResponse:
    del request

    data_update_time = get_data_update_time()

    buy_amount = get_pool_amount("buy", data_update_time)
    sell_amount = get_pool_amount("sell", data_update_time)

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=PoolAmountResponse(
            buy_amount=buy_amount, sell_amount=sell_amount
        ).model_dump(),
    )


class JPEPRulesResponse(BaseModel):
    buy_order_minimum_price: float
    sell_order_minimum_price: float
    trade_fee_percent: float


@JPEP_FTN_market_analyzer_blueprint.get("/JPEP_rules")
def JPEP_rules_handler(request: Request) -> HTTPResponse:  # noqa: N802
    del request

    response = HTTP_CLIENT.post(
        "https://20221023.tp.lanrenmb.net/api/getList/furnish.setting/1/",
        json={
            "fields": "fee,minimum_price,buy_minimum_price",
        },
    )

    response.raise_for_status()
    json_data = response.json()
    if json_data["code"] != 200:
        raise ValueError()

    buy_order_minimum_price = json_data["data"]["buy_minimum_price"]
    sell_order_minimum_price = json_data["data"]["minimum_price"]
    trade_fee_percent = json_data["data"]["fee"]

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=JPEPRulesResponse(
            buy_order_minimum_price=buy_order_minimum_price,
            sell_order_minimum_price=sell_order_minimum_price,
            trade_fee_percent=trade_fee_percent,
        ).model_dump(),
    )


class PriceTrendDataRequest(BaseModel):
    time_range: Literal["24h", "7d", "15d", "30d"]


class PriceTrendDataResponse(BaseModel):
    buy_trend: Dict[str, float]
    sell_trend: Dict[str, float]


@JPEP_FTN_market_analyzer_blueprint.get("/price_trend_data")
@inject_data_model_from_query_args(PriceTrendDataRequest)
def price_trend_data_handler(
    request: Request, data: PriceTrendDataRequest
) -> HTTPResponse:
    del request

    buy_trend = get_price_trend_data("buy", TEXT_TO_TIMEDELTA[data.time_range])
    sell_trend = get_price_trend_data("sell", TEXT_TO_TIMEDELTA[data.time_range])

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=PriceTrendDataResponse(
            buy_trend=buy_trend,
            sell_trend=sell_trend,
        ).model_dump(),
    )


class PoolAmountTrendDataRequest(BaseModel):
    time_range: Literal["24h", "7d", "15d", "30d"]


class PoolAmountTrendDataResponse(BaseModel):
    buy_trend: Dict[str, float]
    sell_trend: Dict[str, float]


@JPEP_FTN_market_analyzer_blueprint.get("/pool_amount_trend_data")
@inject_data_model_from_query_args(PoolAmountTrendDataRequest)
def pool_amount_trend_data_handler(
    request: Request, data: PoolAmountTrendDataRequest
) -> HTTPResponse:
    del request

    buy_trend = get_pool_amount_trend_data("buy", TEXT_TO_TIMEDELTA[data.time_range])
    sell_trend = get_pool_amount_trend_data("sell", TEXT_TO_TIMEDELTA[data.time_range])

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=PoolAmountTrendDataResponse(
            buy_trend=buy_trend,
            sell_trend=sell_trend,
        ).model_dump(),
    )
