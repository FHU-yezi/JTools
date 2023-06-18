from enum import IntEnum
from typing import Dict, List, Literal, Optional

from sanic import Blueprint, HTTPResponse, Request
from sspeedup.api import CODE, sanic_response_json
from yaml import safe_load

from utils.config import config
from utils.pydantic_base import BaseModel

status_blueprint = Blueprint("status", url_prefix="/status")


class InfoStatus(IntEnum):
    NORMAL = 0
    UNAVALIABLE = 1
    DOWNGRADED = 2


class InfoItem(BaseModel):
    status: InfoStatus
    unavaliable_reason: str
    downgraded_reason: str
    enable_data_update_time: bool
    enable_data_count: bool
    db: Optional[str]
    data_update_time_key: Optional[str]
    data_update_time_sort_direction: Optional[Literal["asc", "desc"]]
    data_update_freq_desc: Optional[str]
    data_source: Optional[Dict[str, str]]


with open("tools_info.yaml", encoding="utf-8") as file:
    TOOLS_INFO = {key: InfoItem(**value) for key, value in safe_load(file).items()}


class StatusResponse(BaseModel):
    version: str
    downgraded_tools: List[str]
    unavaliable_tools: List[str]


@status_blueprint.get("/")
def status_handler(request: Request) -> HTTPResponse:
    del request

    version: str = config.version
    downgraded_tools = [
        key
        for key, value in TOOLS_INFO.items()
        if value.status == InfoStatus.DOWNGRADED
    ]
    unavaliable_tools = [
        key
        for key, value in TOOLS_INFO.items()
        if value.status == InfoStatus.UNAVALIABLE
    ]
    return sanic_response_json(
        code=CODE.SUCCESS,
        data=StatusResponse(
            version=version,
            downgraded_tools=downgraded_tools,
            unavaliable_tools=unavaliable_tools,
        ).dict(),
    )
