from typing import Any, Dict, List, Optional

from JianshuResearchTools.assert_funcs import AssertUserUrl
from JianshuResearchTools.exceptions import InputError
from sanic import Blueprint, HTTPResponse, Request
from sspeedup.api import CODE, sanic_response_json

from utils.db import article_FP_rank_db
from utils.inject_data_model import (
    inject_data_model_from_body,
    inject_data_model_from_query_args,
)
from utils.pydantic_base import BaseModel
from utils.text_filter import has_banned_chars

on_rank_article_viewer_blueprint = Blueprint(
    "on_rank_article_viewer", url_prefix="/on_rank_article_viewer"
)


class UserNameAutocompleteRequest(BaseModel):
    name_part: str


class UserNameAutocompleteResponse(BaseModel):
    possible_names: List[str]


@on_rank_article_viewer_blueprint.get("/user_name_autocomplete")
@inject_data_model_from_query_args(UserNameAutocompleteRequest)
def user_name_autocomplete_handler(
    request: Request, data: UserNameAutocompleteRequest
) -> HTTPResponse:
    del request

    if not 0 < len(data.name_part) <= 15:
        return sanic_response_json(
            code=CODE.SUCCESS,
            data=UserNameAutocompleteResponse(possible_names=[]).dict(),
        )
    if has_banned_chars(data.name_part):
        return sanic_response_json(
            code=CODE.SUCCESS,
            data=UserNameAutocompleteResponse(possible_names=[]).dict(),
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
        data=UserNameAutocompleteResponse(possible_names=result).dict(),
    )


class OnRankRecordsRequest(BaseModel):
    user_url: Optional[str]
    user_name: Optional[str]


class OnRankRecordItem(BaseModel):
    date: int
    ranking: int
    title: str
    url: str
    FP_reward_count: float


class OnRankRecordsResponse(BaseModel):
    records: List[OnRankRecordItem]


@on_rank_article_viewer_blueprint.post("/on_rank_records")
@inject_data_model_from_body(OnRankRecordsRequest)
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

    fliter: Dict[str, Any] = (
        {"author.name": data.user_name}
        if data.user_name
        else {"author.url": data.user_url}
    )

    result: List[Dict] = article_FP_rank_db.find(fliter).sort("date", -1).limit(100)  # type: ignore

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=OnRankRecordsResponse(
            records=[
                OnRankRecordItem(
                    date=x["date"].timestamp(),
                    ranking=x["ranking"],
                    title=x["article"]["title"],
                    url=x["article"]["url"],
                    FP_reward_count=x["reward"]["to_author"],
                )
                for x in result
            ]
        ).dict(),
    )
