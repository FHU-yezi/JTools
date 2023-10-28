from datetime import datetime
from typing import Dict, List, Literal, Optional

from litestar import Response, Router, get
from motor.core import AgnosticCollection
from msgspec import Struct
from sspeedup.api.code import Code
from sspeedup.api.litestar import (
    RESPONSE_STRUCT_CONFIG,
    ResponseStruct,
    get_response_struct,
)

from utils.config import config
from utils.db import (
    ARTICLE_FP_RANK_COLLECTION,
    JPEP_FTN_MACKET_COLLECTION,
    LOTTERY_COLLECTION,
    LP_COLLECTIONS_COLLECTION,
)
from utils.tools_config import TOOLS_CONFIG, ToolStatus

COLLECTION_STRING_TO_OBJ: Dict[str, AgnosticCollection] = {
    "article_FP_rank": ARTICLE_FP_RANK_COLLECTION,
    "lottery": LOTTERY_COLLECTION,
    "LP_collections": LP_COLLECTIONS_COLLECTION,
    "JPEP_FTN_market": JPEP_FTN_MACKET_COLLECTION,
}


async def get_data_update_time(
    collection: AgnosticCollection,
    sort_key: str,
    sort_direction: Literal["asc", "desc"],
) -> Optional[datetime]:
    try:
        db_result = (
            await collection.find()
            .sort(sort_key, 1 if sort_direction == "asc" else -1)
            .limit(1)
            .next()
        )
        return db_result[sort_key]
    except StopAsyncIteration:
        return None


async def get_data_count(
    collection: AgnosticCollection, mode: Literal["accurate", "estimated"]
) -> int:
    if mode == "accurate":
        return await collection.count_documents({})

    return await collection.estimated_document_count()


class GetResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    version: str
    downgraded_tools: List[str]
    unavaliable_tools: List[str]


@get("/")
async def get_handler() -> Response[ResponseStruct[GetResponse]]:
    version = config.deploy.version

    downgraded_tools = [
        name
        for name, config in TOOLS_CONFIG.items()
        if config.status == ToolStatus.DOWNGRADED
    ]
    unavaliable_tools = [
        name
        for name, config in TOOLS_CONFIG.items()
        if config.status == ToolStatus.UNAVALIABLE
    ]

    return Response(
        get_response_struct(
            code=Code.SUCCESS,
            data=GetResponse(
                version=version,
                downgraded_tools=downgraded_tools,
                unavaliable_tools=unavaliable_tools,
            ),
        )
    )


class GetToolResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    status: ToolStatus
    reason: Optional[str]
    data_update_time: Optional[datetime]
    data_update_freq: Optional[str]
    data_count: Optional[int]
    data_source: Optional[Dict[str, str]]


@get("/{tool_name: str}")
async def get_tool_handler(tool_name: str) -> Response[ResponseStruct[GetToolResponse]]:
    tool_config = TOOLS_CONFIG.get(tool_name)
    if not tool_config:
        return Response(
            get_response_struct(code=Code.BAD_ARGUMENTS, msg="小工具不存在")
        )

    status = tool_config.status
    reason = tool_config.reason
    data_update_time = (
        await get_data_update_time(
            collection=COLLECTION_STRING_TO_OBJ[
                tool_config.data_update_time.collection
            ],
            sort_key=tool_config.data_update_time.sort_key,
            sort_direction=tool_config.data_update_time.sort_direction,
        )
        if tool_config.data_update_time
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

    return Response(
        get_response_struct(
            code=Code.SUCCESS,
            data=GetToolResponse(
                status=status,
                reason=reason,
                data_update_time=data_update_time,
                data_update_freq=data_update_freq,
                data_count=data_count,
                data_source=data_source,
            ),
        )
    )


STATUS_ROUTER = Router(
    path="/status",
    route_handlers=[
        get_handler,
        get_tool_handler,
    ],
)
