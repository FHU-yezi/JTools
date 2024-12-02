from __future__ import annotations

from datetime import datetime
from typing import Annotated

from litestar import Response, Router, get
from litestar.params import Parameter
from litestar.status_codes import HTTP_400_BAD_REQUEST
from msgspec import Struct
from sspeedup.api.code import Code
from sspeedup.api.litestar import (
    RESPONSE_STRUCT_CONFIG,
    fail,
    generate_response_spec,
    success,
)

from models.tool import StatusEnum, Tool
from utils.config import CONFIG
from utils.tools_status import (
    get_data_count,
    get_last_update_time,
)
from version import VERSION


class GetResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    version: str
    downgraded_tools: list[str]
    unavailable_tools: list[str]


@get(
    "/",
    summary="获取服务状态",
    responses={
        200: generate_response_spec(GetResponse),
    },
)
async def get_handler() -> Response:
    return success(
        data=GetResponse(
            version=VERSION,
            downgraded_tools=list(
                await Tool.get_tools_slugs_by_status(StatusEnum.DOWNGRADED)
            ),
            unavailable_tools=list(
                await Tool.get_tools_slugs_by_status(StatusEnum.UNAVAILABLE)
            ),
        )
    )


class GetToolStatusResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    status: StatusEnum
    reason: str | None
    last_update_time: datetime | None
    data_update_freq: str | None
    data_count: int | None
    data_source: dict[str, str] | None


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
    tool = await Tool.get_by_slug(tool_name)
    if not tool:
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="小工具不存在",
        )

    last_update_time = await get_last_update_time(tool_slug=tool_name)
    data_count = await get_data_count(tool_slug=tool_name)

    # 处理未填写 word_split_access_key 配置项的情况
    if (
        tool_name == "article-wordcloud-generator"
        and tool.status == StatusEnum.NORMAL.value
        and not (
            CONFIG.word_split_access_key.access_key_id
            and CONFIG.word_split_access_key.access_key_secret
        )
    ):
        return success(
            data=GetToolStatusResponse(
                status=StatusEnum.UNAVAILABLE,
                reason="后端未设置分词服务凭据",
                last_update_time=last_update_time,
                data_update_freq=tool.data_update_freq,
                data_count=data_count,
                data_source=tool.data_source,
            )
        )

    return success(
        data=GetToolStatusResponse(
            status=tool.status,
            reason=tool.status_description,
            last_update_time=last_update_time,
            data_update_freq=tool.data_update_freq,
            data_count=data_count,
            data_source=tool.data_source,
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
