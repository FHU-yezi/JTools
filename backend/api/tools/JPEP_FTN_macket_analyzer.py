from datetime import datetime, timedelta  # noqa: N999
from typing import Dict, Literal

from sanic import Blueprint, HTTPResponse, Request
from sspeedup.api import CODE, sanic_response_json
from sspeedup.cache.timeout import timeout_cache

from utils.db import JPEP_FTN_market_db
from utils.inject_data_model import inject_data_model
from utils.pydantic_base import BaseModel
from utils.time_helper import get_data_start_time

TEXT_TO_TIMEDELTA: Dict[str, timedelta] = {
    "24h": timedelta(hours=24),
    "7d": timedelta(days=7),
    "15d": timedelta(days=15),
    "30d": timedelta(days=30),
}

JPEP_FTN_market_analyzer_blueprint = Blueprint(
    "JPEP_FTN_market_analyzer", url_prefix="/JPEP_FTN_market_analyzer"
)


@timeout_cache(300)
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


def get_pool_amount(type_: Literal["buy", "sell"], time: datetime) -> int:
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
        ).dict(),
    )


class PoolAmountComparePieDataResponse(BaseModel):
    buy_amount: int
    sell_amount: int


@JPEP_FTN_market_analyzer_blueprint.get("/pool_amount_compare_pie_data")
def pool_amount_compare_pie_data(request: Request) -> HTTPResponse:
    del request

    data_update_time = get_data_update_time()

    buy_amount = get_pool_amount("buy", data_update_time)
    sell_amount = get_pool_amount("sell", data_update_time)

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=PoolAmountComparePieDataResponse(
            buy_amount=buy_amount, sell_amount=sell_amount
        ).dict(),
    )


class PriceTrendLineDataRequest(BaseModel):
    time_range: Literal["24h", "7d", "15d", "30d"]


class PriceTrendLineDataResponse(BaseModel):
    buy_trend: Dict[str, float]
    sell_trend: Dict[str, float]


@JPEP_FTN_market_analyzer_blueprint.post("/price_trend_line_data")
@inject_data_model(PriceTrendLineDataRequest)
def price_trend_line_data_handler(
    request: Request, data: PriceTrendLineDataRequest
) -> HTTPResponse:
    del request

    buy_trend = get_price_trend_data("buy", TEXT_TO_TIMEDELTA[data.time_range])
    sell_trend = get_price_trend_data("sell", TEXT_TO_TIMEDELTA[data.time_range])

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=PriceTrendLineDataResponse(
            buy_trend=buy_trend,
            sell_trend=sell_trend,
        ).dict(),
    )
