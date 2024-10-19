from datetime import datetime

from litestar import Response, Router, get
from msgspec import Struct
from sspeedup.api.litestar import (
    RESPONSE_STRUCT_CONFIG,
    generate_response_spec,
    success,
)

from models.debug_project_record import DebugProjectRecord
from models.tech_stack import ScopeEnum, TechStack, TypeEnum


class GetDebugProjectRecordsResponseRecordsItem(Struct, **RESPONSE_STRUCT_CONFIG):
    id: int
    date: datetime
    type: str
    module: str
    description: str
    user_name: str
    user_slug: str
    reward: int


class GetDebugProjectRecordsResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    records: list[GetDebugProjectRecordsResponseRecordsItem]


@get(
    "/debug-project-records",
    summary="获取捉虫计划鸣谢名单",
    responses={200: generate_response_spec(GetDebugProjectRecordsResponse)},
)
async def get_debug_project_records_handler() -> Response:
    return success(
        data=GetDebugProjectRecordsResponse(
            records=[
                GetDebugProjectRecordsResponseRecordsItem(
                    id=item.id,
                    date=datetime(
                        year=item.date.year,
                        month=item.date.month,
                        day=item.date.day,
                    ),
                    type=item.type,
                    module=item.module,
                    description=item.description,
                    user_name=item.user_name,
                    user_slug=item.user_slug,
                    reward=item.reward,
                )
                async for item in DebugProjectRecord.iter()
            ]
        )
    )


class GetTechStacksResponseRecordsItem(Struct, **RESPONSE_STRUCT_CONFIG):
    name: str
    type: TypeEnum
    scope: ScopeEnum
    is_self_developed: bool
    description: str
    url: str


class GetTechStacksResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    records: list[GetTechStacksResponseRecordsItem]


@get(
    "/tech-stacks",
    summary="获取技术栈列表",
    responses={200: generate_response_spec(GetTechStacksResponse)},
)
async def get_tech_stacks_handler() -> Response:
    return success(
        data=GetTechStacksResponse(
            records=[
                GetTechStacksResponseRecordsItem(
                    name=item.name,
                    type=item.type,
                    scope=item.scope,
                    is_self_developed=item.is_self_developed,
                    description=item.description,
                    url=item.url,
                )
                async for item in TechStack.iter()
            ]
        )
    )


THANKS_ROUTER = Router(
    path="/thanks",
    route_handlers=[get_debug_project_records_handler, get_tech_stacks_handler],
    tags=["鸣谢"],
)
