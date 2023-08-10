from datetime import datetime
from enum import IntEnum
from typing import Dict, Literal, Optional

from pydantic import Field
from pymongo.collection import Collection
from sanic import Blueprint, HTTPResponse, Request
from sspeedup.api import CODE, sanic_response_json
from sspeedup.data_validation import BaseModel, sanic_inject_pydantic_model
from sspeedup.dict_helper import filter_null_value
from yaml import safe_load

from utils.db import (
    JPEP_FTN_market_db,
    LP_collections_db,
    article_FP_rank_db,
    lottery_db,
)

DB_STRING_TO_OBJ: Dict[str, Collection] = {
    "article_FP_rank": article_FP_rank_db,
    "lottery": lottery_db,
    "LP_collections": LP_collections_db,
    "JPEP_FTN_market": JPEP_FTN_market_db,
}

with open("tools_info.yaml", encoding="utf-8") as file:
    TOOLS_INFO = safe_load(file)

info_blueprint = Blueprint("info", url_prefix="/info")


def get_data_update_time(
    db: str, key: str, sort_direction: Literal["asc", "desc"]
) -> Optional[datetime]:
    db_result = (
        DB_STRING_TO_OBJ[db]
        .find()
        .sort(key, {"asc": 1, "desc": -1}[sort_direction])
        .limit(1)
    )

    try:
        return db_result.next()[key]
    except StopIteration:
        return None


def get_data_count(db: str) -> int:
    return DB_STRING_TO_OBJ[db].estimated_document_count()


class InfoStatus(IntEnum):
    NORMAL = 0
    UNAVALIABLE = 1
    DOWNGRADED = 2


class InfoItem(BaseModel):
    status: InfoStatus = Field(InfoStatus, strict=False)
    reason: str
    enable_data_update_time: bool
    enable_data_count: bool
    db: Optional[str] = None
    data_update_time_key: Optional[str] = None
    data_update_time_sort_direction: Optional[Literal["asc", "desc"]] = None
    data_update_freq_desc: Optional[str] = None
    data_source: Optional[Dict[str, str]] = None


class InfoRequest(BaseModel):
    tool_slug: str


class InfoResponse(BaseModel):
    status: InfoStatus = Field(InfoStatus, strict=False)
    reason: Optional[str] = None
    data_update_time: Optional[int] = None
    data_update_freq_desc: Optional[str] = None
    data_count: Optional[int] = None
    data_source: Optional[Dict[str, str]] = None


@info_blueprint.get("/")
@sanic_inject_pydantic_model(InfoRequest, source="query_args")
def info_handler(request: Request, data: InfoRequest) -> HTTPResponse:
    del request

    if data.tool_slug not in TOOLS_INFO:
        return sanic_response_json(code=CODE.BAD_ARGUMENTS, message="小工具不存在")

    info = InfoItem(**TOOLS_INFO[data.tool_slug])

    status = info.status
    reason = info.reason if len(info.reason) != 0 else None
    data_update_time = (
        get_data_update_time(
            info.db,  # type: ignore
            info.data_update_time_key,  # type: ignore
            info.data_update_time_sort_direction,  # type: ignore
        )
        if info.enable_data_update_time
        else None
    )
    data_count = get_data_count(info.db) if info.enable_data_count else None  # type: ignore
    data_update_freq_desc = info.data_update_freq_desc
    data_source = info.data_source

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=filter_null_value(
            InfoResponse(
                status=status,
                reason=reason,
                data_update_time=int(data_update_time.timestamp())
                if data_update_time is not None
                else None,
                data_count=data_count,
                data_update_freq_desc=data_update_freq_desc,
                data_source=data_source,
            ).model_dump()
        ),
    )
