from datetime import datetime
from typing import Annotated, Literal, Optional

from litestar import Response, Router, get
from litestar.params import Parameter
from litestar.status_codes import HTTP_400_BAD_REQUEST
from msgspec import Struct
from sshared.mongo import Document
from sspeedup.api.code import Code
from sspeedup.api.litestar import (
    RESPONSE_STRUCT_CONFIG,
    fail,
    generate_response_spec,
    success,
)

from models.jianshu.article_earning_ranking_record import (
    ArticleEarningRankingRecordDocument,
)
from models.jianshu.lottery_win_record import LotteryWinRecordDocument
from models.jpep.ftn_trade_order import FTNTradeOrderDocument
from utils.tools_config import TOOLS_CONFIG, ToolStatus
from version import VERSION

COLLECTION_STRING_TO_OBJ: dict[str, type[Document]] = {
    "article_earning_ranking_records": ArticleEarningRankingRecordDocument,
    "lottery_win_records": LotteryWinRecordDocument,
    "FTN_trade_orders": FTNTradeOrderDocument,
}


async def get_last_update_time(
    collection: type[Document],
    sort_key: str,
    sort_direction: Literal["asc", "desc"],
) -> Optional[datetime]:
    latest_record = await collection.find_one(
        sort={sort_key: "ASC" if sort_direction == "asc" else "DESC"}
    )

    # 获取到的是数据记录对象，将其转换为字典
    # 然后通过驼峰样式的 sort_key 获取到数据更新时间
    return latest_record.to_dict()[sort_key] if latest_record else None


async def get_data_count(
    collection: type[Document], mode: Literal["accurate", "estimated"]
) -> int:
    return await collection.count(fast=mode == "estimated")


class GetResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    version: str
    downgraded_tools: list[str]
    unavaliable_tools: list[str]


@get(
    "/",
    summary="获取服务状态",
    responses={
        200: generate_response_spec(GetResponse),
    },
)
async def get_handler() -> Response:
    downgraded_tools = [
        name
        for name, config in TOOLS_CONFIG.items()
        if config.status == ToolStatus.DOWNGRADED
    ]
    unavaliable_tools = [
        name
        for name, config in TOOLS_CONFIG.items()
        if config.status == ToolStatus.UNAVAILABLE
    ]

    return success(
        data=GetResponse(
            version=VERSION,
            downgraded_tools=downgraded_tools,
            unavaliable_tools=unavaliable_tools,
        )
    )


class GetToolStatusResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    status: ToolStatus
    reason: Optional[str]
    last_update_time: Optional[datetime]
    data_update_freq: Optional[str]
    data_count: Optional[int]
    data_source: Optional[dict[str, str]]


@get(
    "/{tool_name: str}",
    summary="获取小工具服务状态",
    responses={
        200: generate_response_spec(GetToolStatusResponse),
        400: generate_response_spec(),
    },
)
async def get_tool_status_handler(
    tool_name: Annotated[str, Parameter(description="小工具名称", max_length=100)],
) -> Response:
    tool_config = TOOLS_CONFIG.get(tool_name)
    if not tool_config:
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="小工具不存在",
        )

    status = tool_config.status
    reason = tool_config.reason
    last_update_time = (
        await get_last_update_time(
            collection=COLLECTION_STRING_TO_OBJ[
                tool_config.last_update_time.collection
            ],
            sort_key=tool_config.last_update_time.sort_key,
            sort_direction=tool_config.last_update_time.sort_direction,
        )
        if tool_config.last_update_time
        else None
    )
    data_update_freq = tool_config.data_update_freq
    data_count = (
        await get_data_count(
            collection=COLLECTION_STRING_TO_OBJ[tool_config.data_count.collection],
            mode=tool_config.data_count.mode,
        )
        if tool_config.data_count
        else None
    )
    data_source = tool_config.data_source

    return success(
        data=GetToolStatusResponse(
            status=status,
            reason=reason,
            last_update_time=last_update_time,
            data_update_freq=data_update_freq,
            data_count=data_count,
            data_source=data_source,
        )
    )


STATUS_ROUTER = Router(
    path="/status",
    route_handlers=[
        get_handler,
        get_tool_status_handler,
    ],
    tags=["服务状态"],
)
