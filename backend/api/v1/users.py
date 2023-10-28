from datetime import datetime
from typing import List, Literal, Optional

from JianshuResearchTools.convert import UserSlugToUserUrl
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.user import GetUserVIPInfo
from litestar import Response, Router, get
from msgspec import Struct
from sspeedup.api.code import Code
from sspeedup.api.litestar import (
    RESPONSE_STRUCT_CONFIG,
    ResponseStruct,
    get_response_struct,
)
from sspeedup.sync_to_async import sync_to_async

from api.v1.lottery import REWARDS
from utils.db import LOTTERY_COLLECTION


class GetVipInfoResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    is_vip: bool
    type: Optional[Literal["bronze", "sliver", "gold", "platina"]]  # noqa: A003
    expire_date: Optional[datetime]


@get("/{user_slug: str}/vip-info")
async def get_vip_info_handler(
    user_slug: str
) -> Response[ResponseStruct[GetVipInfoResponse]]:
    try:
        vip_info = await sync_to_async(GetUserVIPInfo, UserSlugToUserUrl(user_slug))
    except InputError:
        return Response(
            get_response_struct(
                code=Code.BAD_ARGUMENTS,
                msg="输入的简书个人主页链接无效",
            )
        )
    except ResourceError:
        return Response(
            get_response_struct(
                code=Code.BAD_ARGUMENTS,
                msg="用户已注销或被封禁",
            )
        )

    is_vip = vip_info["vip_type"] is not None
    type_ = vip_info["vip_type"]
    expire_date = vip_info["expire_date"]

    return Response(
        get_response_struct(
            code=Code.SUCCESS,
            data=GetVipInfoResponse(is_vip=is_vip, type=type_, expire_date=expire_date),
        )
    )


class GetLotteryWinRecordItem(Struct, **RESPONSE_STRUCT_CONFIG):
    time: datetime
    reward_name: str


class GetLotteryWinRecordsResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    records: List[GetLotteryWinRecordItem]


@get("/{user_slug: str}/lottery-win-records")
async def get_lottery_win_records(
    user_slug: str,
    offset: int = 0,
    limit: int = 20,
    target_rewards: Optional[List[str]] = None,
) -> Response[ResponseStruct[GetLotteryWinRecordsResponse]]:
    try:
        user_url = UserSlugToUserUrl(user_slug)
    except InputError:
        return Response(
            get_response_struct(
                code=Code.BAD_ARGUMENTS,
                msg="输入的简书个人主页链接无效",
            )
        )

    result = (
        LOTTERY_COLLECTION.find(
            {
                "user.url": user_url,
                "reward_name": {
                    "$in": target_rewards if target_rewards else REWARDS,
                },
            }
        )
        .skip(offset)
        .limit(limit)
    )

    records: List[GetLotteryWinRecordItem] = []
    async for item in result:
        records.append(
            GetLotteryWinRecordItem(
                time=item["time"],
                reward_name=item["reward_name"],
            )
        )

    return Response(
        get_response_struct(
            code=Code.SUCCESS,
            data=GetLotteryWinRecordsResponse(
                records=records,
            ),
        )
    )


USERS_ROUTER = Router(
    path="/users",
    route_handlers=[
        get_vip_info_handler,
        get_lottery_win_records,
    ],
)
