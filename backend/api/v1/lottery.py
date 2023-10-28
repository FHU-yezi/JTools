from datetime import datetime
from typing import List, Optional

from litestar import Response, Router, get
from msgspec import Struct
from sspeedup.api.code import Code
from sspeedup.api.litestar import (
    RESPONSE_STRUCT_CONFIG,
    ResponseStruct,
    get_response_struct,
)

from utils.db import LOTTERY_COLLECTION

REWARDS: List[str] = [
    "收益加成卡100",
    "收益加成卡1万",
    "四叶草徽章",
    "锦鲤头像框1年",
]


class GetRewardsResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    rewards: List[str]


@get("/rewards")
async def get_rewards_handler() -> Response[ResponseStruct[GetRewardsResponse]]:
    return Response(
        get_response_struct(
            code=Code.SUCCESS,
            data=GetRewardsResponse(
                rewards=REWARDS,
            ),
        )
    )


class GetRecordItem(Struct, **RESPONSE_STRUCT_CONFIG):
    time: datetime
    reward_name: str


class GetRecordsResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    records: List[GetRecordItem]


@get("/records")
async def get_records_handler(
    offset: int = 0,
    limit: int = 20,
    target_rewards: Optional[List[str]] = None,
) -> Response[ResponseStruct]:
    result = (
        LOTTERY_COLLECTION.find(
            {
                "reward_name": {
                    "$in": target_rewards if target_rewards else REWARDS,
                }
            }
        )
        .sort("time", -1)
        .skip(offset)
        .limit(limit)
    )

    records: List[GetRecordItem] = []
    async for item in result:
        records.append(
            GetRecordItem(
                time=item["time"],
                reward_name=item["reward_name"],
            )
        )

    return Response(
        get_response_struct(
            code=Code.SUCCESS,
            data=GetRecordsResponse(
                records=records,
            ),
        )
    )


LOTTERY_ROUTER = Router(
    path="/lottery",
    route_handlers=[
        get_rewards_handler,
        get_records_handler,
    ],
)
