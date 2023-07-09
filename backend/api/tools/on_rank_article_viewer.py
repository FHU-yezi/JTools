from typing import Any, Dict, List, Optional

from JianshuResearchTools.assert_funcs import AssertUserUrl
from JianshuResearchTools.exceptions import InputError
from sanic import Blueprint, HTTPResponse, Request
from sspeedup.api import CODE, sanic_response_json
from sspeedup.data_validation import BaseModel, sanic_inject_pydantic_model

from utils.db import article_FP_rank_db
from utils.text_filter import has_banned_chars

on_rank_article_viewer_blueprint = Blueprint(
    "on_rank_article_viewer", url_prefix="/on_rank_article_viewer"
)


class UserNameAutocompleteRequest(BaseModel):
    name_part: str


class UserNameAutocompleteResponse(BaseModel):
    possible_names: List[str]


@on_rank_article_viewer_blueprint.get("/user_name_autocomplete")
@sanic_inject_pydantic_model(UserNameAutocompleteRequest, source="query_args")
def user_name_autocomplete_handler(
    request: Request, data: UserNameAutocompleteRequest
) -> HTTPResponse:
    del request

    if not 0 < len(data.name_part) <= 15:
        return sanic_response_json(
            code=CODE.SUCCESS,
            data=UserNameAutocompleteResponse(possible_names=[]).model_dump(),
        )
    if has_banned_chars(data.name_part):
        return sanic_response_json(
            code=CODE.SUCCESS,
            data=UserNameAutocompleteResponse(possible_names=[]).model_dump(),
        )

    result: List[str] = (
        article_FP_rank_db.distinct(
            "author.name",
            {
                "author.name": {
                    "$regex": f"^{data.name_part}",
                },
            },
        )
    )[:5]

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=UserNameAutocompleteResponse(possible_names=result).model_dump(),
    )


class OnRankRecordsRequest(BaseModel):
    user_url: Optional[str] = None
    user_name: Optional[str] = None
    offset: int


class OnRankRecordItem(BaseModel):
    date: int
    ranking: int
    title: str
    url: str
    FP_reward_count: float


class OnRankRecordsResponse(BaseModel):
    records: List[OnRankRecordItem]
    total: int


@on_rank_article_viewer_blueprint.post("/on_rank_records")
@sanic_inject_pydantic_model(OnRankRecordsRequest)
def on_rank_records_handler(
    request: Request, data: OnRankRecordsRequest
) -> HTTPResponse:
    del request

    if not data.user_url and not data.user_name:
        return sanic_response_json(
            code=CODE.BAD_ARGUMENTS, message="用户个人主页链接或用户昵称必须至少传入一个"
        )
    if data.user_url and data.user_name:
        return sanic_response_json(
            code=CODE.BAD_ARGUMENTS, message="用户个人主页链接和用户昵称不能同时传入"
        )
    if data.user_url:
        try:
            AssertUserUrl(data.user_url)
        except InputError:
            return sanic_response_json(code=CODE.BAD_ARGUMENTS, message="输入的用户个人主页链接无效")

    filter_dict: Dict[str, Any] = (
        {"author.name": data.user_name}
        if data.user_name
        else {"author.url": data.user_url}
    )

    result: List[Dict] = (
        article_FP_rank_db.find(filter_dict)
        .sort("date", -1)
        .skip(data.offset)
        .limit(50)
    )  # type: ignore
    total = article_FP_rank_db.count_documents(filter_dict)

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=OnRankRecordsResponse(
            records=[
                OnRankRecordItem(
                    date=int(x["date"].timestamp()),
                    ranking=x["ranking"],
                    title=x["article"]["title"],
                    url=x["article"]["url"],
                    FP_reward_count=x["reward"]["to_author"],
                )
                for x in result
            ],
            total=total,
        ).model_dump(),
    )
