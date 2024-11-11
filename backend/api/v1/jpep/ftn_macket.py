from asyncio import gather
from datetime import datetime
from typing import Annotated, Literal, Optional

from jkit.jpep.platform_settings import PlatformSettings
from litestar import Response, Router, get
from litestar.params import Parameter
from msgspec import Struct, field
from sshared.time import get_datetime_before_now, parse_td_str
from sspeedup.api.litestar import (
    RESPONSE_STRUCT_CONFIG,
    generate_response_spec,
    success,
)

from models.jpep.ftn_macket_record import FTNMacketRecord

RESOLUTION_MAPPING: dict[str, Literal["max", "hour", "day"]] = {
    "5m": "max",  # TODO
    "1h": "hour",
    "1d": "day",
}

PLATFORM_SETTINGS = PlatformSettings()


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
            # TODO
            buy_order_minimum_price=settings.ftn_sell_trade_minimum_price,
            sell_order_minimum_price=settings.ftn_buy_trade_minimum_price,
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
    buy_price, sell_price = await gather(
        FTNMacketRecord.get_current_price("BUY"),
        FTNMacketRecord.get_current_price("SELL"),
    )

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
        FTNMacketRecord.get_current_amount("BUY"),
        FTNMacketRecord.get_current_amount("SELL"),
    )

    return success(
        data=GetCurrentAmountResponse(
            buy_amount=buy_amount,
            sell_amount=sell_amount,
        )
    )


class GetPriceHistoryResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    history: dict[datetime, float]


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
    history = await FTNMacketRecord.get_price_history(
        type=type_.upper(),  # type: ignore
        start_time=get_datetime_before_now(parse_td_str(range)),
        resolution=RESOLUTION_MAPPING[resolution],
    )

    return success(
        data=GetPriceHistoryResponse(
            history=history,
        )
    )


class GetAmountHistoryResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    history: dict[datetime, int]


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
    history = await FTNMacketRecord.get_amount_history(
        type=type_.upper(),  # type: ignore
        start_time=get_datetime_before_now(parse_td_str(range)),
        resolution=RESOLUTION_MAPPING[resolution],
    )

    return success(
        data=GetAmountHistoryResponse(
            history=history,
        )
    )


class GetCurrentAmountDistributionResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    amount_distribution: dict[float, int]


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
    amount_distribution = await FTNMacketRecord.get_current_amount_distribution(
        type=type_.upper(),  # type: ignore
        limit=limit,
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
