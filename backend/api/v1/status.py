from datetime import datetime
from typing import Annotated, Optional

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
from utils.tools_status import (
    COLLECTION_NAME_TO_OBJ,
    get_data_count,
    get_last_update_time,
)
from version import VERSION


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
    return success(
        data=GetResponse(
            version=VERSION,
            downgraded_tools=list(
                await Tool.get_tools_slugs_by_status(StatusEnum.DOWNGRADED)
            ),
            unavaliable_tools=list(
                await Tool.get_tools_slugs_by_status(StatusEnum.UNAVAILABLE)
            ),
        )
    )


class GetToolStatusResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    status: StatusEnum
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
    tool = await Tool.get_by_slug(tool_name)
    if not tool:
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="小工具不存在",
        )

    if (
        tool.last_update_time_table
        and tool.last_update_time_order_by
        and tool.last_update_time_target_field
    ):
        last_update_time = await get_last_update_time(
            collection=COLLECTION_NAME_TO_OBJ[tool.last_update_time_table],
            order_by=tool.last_update_time_order_by,
            target_field=tool.last_update_time_target_field,
        )
    else:
        last_update_time = None

    if tool.data_count_table:
        data_count = await get_data_count(
            collection=COLLECTION_NAME_TO_OBJ[tool.data_count_table],
        )
    else:
        data_count = None

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
