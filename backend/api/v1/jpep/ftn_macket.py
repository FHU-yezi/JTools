from asyncio import gather
from datetime import datetime, timedelta
from typing import Annotated, Any, Dict, Literal, Optional

from jkit.jpep.platform_settings import PlatformSettings
from litestar import Response, Router, get
from litestar.params import Parameter
from msgspec import Struct, field
from sspeedup.api.litestar import (
    RESPONSE_STRUCT_CONFIG,
    generate_response_spec,
    success,
)
from sspeedup.time_helper import get_start_time

from utils.db import JPEP_FTN_MACKET_COLLECTION

RANGE_TO_TIMEDELTA: Dict[str, timedelta] = {
    "24h": timedelta(hours=24),
    "7d": timedelta(days=7),
    "15d": timedelta(days=15),
    "30d": timedelta(days=30),
}

RESOLUTION_TO_TIME_UNIT: Dict[str, str] = {
    "5m": "minute",  # 目前未使用
    "1h": "hour",
    "1d": "day",
}

PLATFORM_SETTINGS = PlatformSettings()


async def get_data_update_time() -> datetime:
    result = (
        await JPEP_FTN_MACKET_COLLECTION.find(
            {},
            {
                "_id": 0,
                "fetch_time": 1,
            },
        )
        .sort("fetch_time", -1)
        .limit(1)
        .next()
    )
    return result["fetch_time"]


async def get_latest_order(type_: Literal["buy", "sell"]) -> Optional[Dict[str, Any]]:
    time = await get_data_update_time()
    try:
        return (
            await JPEP_FTN_MACKET_COLLECTION.find(
                {
                    "fetch_time": time,
                    "trade_type": type_,
                    "amount.tradable": {"$ne": 0},
                }
            )
            .sort("price", 1 if type_ == "buy" else -1)
            .limit(1)
            .next()
        )
    except StopAsyncIteration:  # 该侧没有挂单
        return None


async def get_current_amount(type_: Literal["buy", "sell"]) -> Optional[int]:
    time = await get_data_update_time()

    try:
        result = await JPEP_FTN_MACKET_COLLECTION.aggregate(
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
        ).next()
        return result["sum"]
    except StopIteration:  # 该侧没有挂单
        return None


async def get_price_history(
    type_: Literal["buy", "sell"], td: timedelta, time_unit: str
) -> Dict[datetime, float]:
    result = JPEP_FTN_MACKET_COLLECTION.aggregate(
        [
            {
                "$match": {
                    "trade_type": type_,
                    "fetch_time": {
                        "$gte": get_start_time(td),
                    },
                },
            },
            {
                "$group": {
                    "_id": (
                        {
                            "$dateTrunc": {
                                "date": "$fetch_time",
                                "unit": time_unit,
                            },
                        }
                    )
                    if time_unit != "minute"
                    else "$fetch_time",
                    "price": {
                        "$min" if type_ == "buy" else "$max": "$price",
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

    return {item["_id"]: item["price"] async for item in result}


async def get_amount_history(
    type_: Literal["buy", "sell"], td: timedelta, time_unit: str
) -> Dict[datetime, float]:
    result = JPEP_FTN_MACKET_COLLECTION.aggregate(
        [
            {
                "$match": {
                    "trade_type": type_,
                    "fetch_time": {
                        "$gte": get_start_time(td),
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
                    "_id": (
                        {
                            "$dateTrunc": {
                                "date": "$_id",
                                "unit": time_unit,
                            },
                        }
                    )
                    if time_unit != "minute"
                    else "$_id",
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

    return {item["_id"]: round(item["amount"]) async for item in result}


async def get_current_amount_distribution(
    type_: Literal["buy", "sell"],
    limit: int,
) -> Dict[float, int]:
    time = await get_data_update_time()

    result = JPEP_FTN_MACKET_COLLECTION.aggregate(
        [
            {
                "$match": {
                    "fetch_time": time,
                    "trade_type": type_,
                },
            },
            {
                "$group": {
                    "_id": "$price",
                    "amount": {
                        "$sum": "$amount.tradable",
                    },
                },
            },
            {
                "$match": {
                    "amount": {
                        "$ne": 0,
                    },
                },
            },
            {
                "$sort": {
                    "_id": 1 if type_ == "buy" else -1,
                },
            },
            {
                "$limit": limit,
            },
        ]
    )

    return {item["_id"]: item["amount"] async for item in result}


class GetRulesResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    is_open: bool
    buy_order_minimum_price: float
    sell_order_minimum_price: float
    FTN_order_fee: float = field(name="FTNOrderFee")
    goods_order_fee: float


@get(
    "/rules",
    summary="获取贝市交易配置",
    responses={
        200: generate_response_spec(GetRulesResponse),
    },
)
async def get_rules_handler() -> Response:
    settings = await PLATFORM_SETTINGS.get_data()

    return success(
        data=GetRulesResponse(
            is_open=settings.opening,
            buy_order_minimum_price=settings.ftn_buy_trade_minimum_price,
            sell_order_minimum_price=settings.ftn_sell_trade_minimum_price,
            FTN_order_fee=settings.ftn_trade_fee,
            goods_order_fee=settings.goods_trade_fee,
        )
    )


class GetCurrentPriceResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    buy_price: Optional[float]
    sell_price: Optional[float]


@get(
    "/current-price",
    summary="获取当前贝价",
    responses={
        200: generate_response_spec(GetCurrentPriceResponse),
    },
)
async def get_current_price_handler() -> Response:
    buy_order, sell_order = await gather(
        get_latest_order("buy"), get_latest_order("sell")
    )

    buy_price = buy_order["price"] if buy_order else None
    sell_price = sell_order["price"] if sell_order else None

    return success(
        data=GetCurrentPriceResponse(
            buy_price=buy_price,
            sell_price=sell_price,
        )
    )


class GetCurrentAmountResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    buy_amount: Optional[int]
    sell_amount: Optional[int]


@get(
    "/current-amount",
    summary="获取当前挂单量",
    responses={
        200: generate_response_spec(GetCurrentAmountResponse),
    },
)
async def get_current_amount_handler() -> Response:
    buy_amount, sell_amount = await gather(
        get_current_amount("buy"),
        get_current_amount("sell"),
    )

    return success(
        data=GetCurrentAmountResponse(
            buy_amount=buy_amount,
            sell_amount=sell_amount,
        )
    )


class GetPriceHistoryResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    history: Dict[datetime, float]


@get(
    "/price-history",
    summary="获取历史价格",
    responses={
        200: generate_response_spec(GetPriceHistoryResponse),
    },
)
async def get_price_history_handler(
    type_: Annotated[
        Literal["buy", "sell"], Parameter(description="交易单类型", query="type")
    ],
    range: Annotated[  # noqa: A002
        Literal["24h", "7d", "15d", "30d"], Parameter(description="时间范围")
    ],
    resolution: Annotated[Literal["5m", "1h", "1d"], Parameter(description="统计粒度")],
) -> Response:
    history = await get_price_history(
        type_=type_,
        td=RANGE_TO_TIMEDELTA[range],
        time_unit=RESOLUTION_TO_TIME_UNIT[resolution],
    )

    return success(
        data=GetPriceHistoryResponse(
            history=history,
        )
    )


class GetAmountHistoryResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    history: Dict[datetime, float]


@get(
    "/amount-history",
    summary="获取历史挂单量",
    responses={
        200: generate_response_spec(GetAmountHistoryResponse),
    },
)
async def get_amount_history_handler(
    type_: Annotated[
        Literal["buy", "sell"], Parameter(description="交易单类型", query="type")
    ],
    range: Annotated[  # noqa: A002
        Literal["24h", "7d", "15d", "30d"], Parameter(description="时间范围")
    ],
    resolution: Annotated[Literal["5m", "1h", "1d"], Parameter(description="统计粒度")],
) -> Response:
    history = await get_amount_history(
        type_=type_,
        td=RANGE_TO_TIMEDELTA[range],
        time_unit=RESOLUTION_TO_TIME_UNIT[resolution],
    )

    return success(
        data=GetAmountHistoryResponse(
            history=history,
        )
    )


class GetCurrentAmountDistributionResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    amount_distribution: Dict[float, int]


@get(
    "/current-amount-distribution",
    summary="获取当前挂单分布",
    responses={
        200: generate_response_spec(GetCurrentAmountDistributionResponse),
    },
)
async def get_current_amount_distribution_handler(
    type_: Annotated[
        Literal["buy", "sell"], Parameter(description="交易单类型", query="type")
    ],
    limit: Annotated[int, Parameter(description="结果数量", gt=0, le=100)] = 10,
) -> Response:
    amount_distribution = await get_current_amount_distribution(
        type_=type_, limit=limit
    )

    return success(
        data=GetCurrentAmountDistributionResponse(
            amount_distribution=amount_distribution,
        )
    )


FTN_MACKET_ROUTER = Router(
    path="/ftn-macket",
    route_handlers=[
        get_rules_handler,
        get_current_price_handler,
        get_current_amount_handler,
        get_price_history_handler,
        get_amount_history_handler,
        get_current_amount_distribution_handler,
    ],
    tags=["简书积分兑换平台 - 贝市"],
)
