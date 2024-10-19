from datetime import datetime

from litestar import Response, Router, get
from msgspec import Struct
from sspeedup.api.litestar import (
    RESPONSE_STRUCT_CONFIG,
    generate_response_spec,
    success,
)

from models.debug_project_record import DebugProjectRecord


class GetDebugProjectResponseRecordsItem(Struct, **RESPONSE_STRUCT_CONFIG):
    id: int
    date: datetime
    type: str
    module: str
    description: str
    user_name: str
    user_slug: str
    reward: int


class GetDebugProjectResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    records: list[GetDebugProjectResponseRecordsItem]


@get(
    "/debug-project-records",
    summary="获取捉虫计划鸣谢名单",
    responses={200: generate_response_spec(GetDebugProjectResponse)},
)
async def get_debug_project_records_handler() -> Response:
    return success(
        data=GetDebugProjectResponse(
            records=[
                GetDebugProjectResponseRecordsItem(
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


THANKS_ROUTER = Router(
    path="/thanks",
    route_handlers=[get_debug_project_records_handler],
    tags=["鸣谢"],
)
