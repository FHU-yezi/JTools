from datetime import datetime
from typing import Dict, List, Literal, Optional

from JianshuResearchTools.convert import UserSlugToUserUrl
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.user import GetUserVIPInfo
from litestar import Response, Router, get
from msgspec import Struct, field
from sspeedup.api.code import Code
from sspeedup.api.litestar import (
    RESPONSE_STRUCT_CONFIG,
    fail,
    success,
)
from sspeedup.sync_to_async import sync_to_async

from api.v1.lottery import REWARD_NAMES
from utils.db import ARTICLE_FP_RANK_COLLECTION, LOTTERY_COLLECTION


class GetVipInfoResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    is_vip: bool
    type: Optional[Literal["bronze", "sliver", "gold", "platina"]]  # noqa: A003
    expire_date: Optional[datetime]


@get("/{user_slug: str}/vip-info")
async def get_vip_info_handler(user_slug: str) -> Response:
    try:
        vip_info = await sync_to_async(GetUserVIPInfo, UserSlugToUserUrl(user_slug))
    except InputError:
        return fail(
            code=Code.BAD_ARGUMENTS,
            msg="输入的简书个人主页链接无效",
        )
    except ResourceError:
        return fail(
            code=Code.BAD_ARGUMENTS,
            msg="用户已注销或被封禁",
        )

    is_vip = vip_info["vip_type"] is not None
    type_ = vip_info["vip_type"]
    expire_date = vip_info["expire_date"]

    return success(
        data=GetVipInfoResponse(
            is_vip=is_vip,
            type=type_,
            expire_date=expire_date,
        )
    )


class GetLotteryWinRecordItem(Struct, **RESPONSE_STRUCT_CONFIG):
    time: datetime
    reward_name: str


class GetLotteryWinRecordsResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    records: List[GetLotteryWinRecordItem]


@get("/{user_slug: str}/lottery-win-records")
async def get_lottery_win_records(
    user_slug: str,
    offset: int = 0,
    limit: int = 20,
    target_rewards: Optional[List[str]] = None,
) -> Response:
    try:
        user_url = UserSlugToUserUrl(user_slug)
    except InputError:
        return fail(
            code=Code.BAD_ARGUMENTS,
            msg="输入的简书个人主页链接无效",
        )

    result = (
        LOTTERY_COLLECTION.find(
            {
                "user.url": user_url,
                "reward_name": {
                    "$in": target_rewards if target_rewards else REWARD_NAMES,
                },
            }
        )
        .skip(offset)
        .limit(limit)
    )

    records: List[GetLotteryWinRecordItem] = []
    async for item in result:
        records.append(
            GetLotteryWinRecordItem(
                time=item["time"],
                reward_name=item["reward_name"],
            )
        )

    return success(
        data=GetLotteryWinRecordsResponse(
            records=records,
        )
    )


class GetOnrankRecordItem(Struct, **RESPONSE_STRUCT_CONFIG):
    date: datetime
    ranking: int
    article_title: str
    article_url: str
    FP_reward: float = field(name="FPReward")


class GetOnArticleRankRecordsResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    records: List[GetOnrankRecordItem]


@get("/on-article-rank-records")
async def get_on_article_rank_records_handler(
    user_slug: Optional[str] = None,
    user_name: Optional[str] = None,
    order_by: Literal["date", "ranking"] = "date",
    order_direction: Literal["asc", "desc"] = "desc",
    offset: int = 0,
    limit: int = 20,
) -> Response:
    if not user_slug and not user_name:
        return fail(
            code=Code.BAD_ARGUMENTS,
            msg="必须提供用户 slug 或用户昵称",
        )

    if user_slug and user_name:
        return fail(
            code=Code.BAD_ARGUMENTS,
            msg="用户 slug 或用户昵称不能同时提供",
        )

    if user_slug:
        try:
            user_url = UserSlugToUserUrl(user_slug)
        except InputError:
            return fail(
                code=Code.BAD_ARGUMENTS,
                msg="输入的简书个人主页链接无效",
            )
    else:
        user_url = None

    result = (
        ARTICLE_FP_RANK_COLLECTION.find(
            {"author.url": user_url} if user_url else {"author.name": user_name}
        )
        .sort(order_by, 1 if order_direction == "asc" else -1)
        .skip(offset)
        .limit(limit)
    )

    records: List[GetOnrankRecordItem] = []
    async for item in result:
        records.append(
            GetOnrankRecordItem(
                date=item["date"],
                ranking=item["ranking"],
                article_title=item["article"]["title"],
                article_url=item["article"]["url"],
                FP_reward=item["reward"]["to_author"],
            )
        )

    return success(
        data=GetOnArticleRankRecordsResponse(
            records=records,
        )
    )


class GetOnArticleRankSummaryResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    top10: int
    top30: int
    top50: int
    total: int


@get("/on-article-rank-summary")
async def get_on_article_rank_summary_handler(
    user_slug: Optional[str] = None,
    user_name: Optional[str] = None,
) -> Response:
    if not user_slug and not user_name:
        return fail(
            code=Code.BAD_ARGUMENTS,
            msg="必须提供用户 slug 或用户昵称",
        )

    if user_slug and user_name:
        return fail(
            code=Code.BAD_ARGUMENTS,
            msg="用户 slug 或用户昵称不能同时提供",
        )

    if user_slug:
        try:
            user_url = UserSlugToUserUrl(user_slug)
        except InputError:
            return fail(
                code=Code.BAD_ARGUMENTS,
                msg="输入的简书个人主页链接无效",
            )
    else:
        user_url = None

    records = ARTICLE_FP_RANK_COLLECTION.find(
        {"author.url": user_url} if user_url else {"author.name": user_name},
        {"_id": False, "ranking": True},
    )

    top10 = 0
    top30 = 0
    top50 = 0
    total = 0
    async for item in records:
        ranking = item["ranking"]
        if ranking <= 10:
            top10 += 1
        if ranking <= 30:
            top30 += 1
        if ranking <= 50:
            top50 += 1

        total += 1

    return success(
        data=GetOnArticleRankSummaryResponse(
            top10=top10,
            top30=top30,
            top50=top50,
            total=total,
        )
    )


class GetNameAutocompleteResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    names: List[str]


@get("/name-autocomplete")
async def get_name_autocomplete_handler(name_part: str, limit: int = 5) -> Response:
    result = await ARTICLE_FP_RANK_COLLECTION.distinct(
        "author.name",
        {
            "author.name": {
                "$regex": f"^{name_part}",
            },
        },
    )
    result = result[:limit]

    return success(
        data=GetNameAutocompleteResponse(
            names=result,
        )
    )


class GetHistoryNamesOnArticleRankSummaryResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    history_names_onrank_summary: Dict[str, int]
    user_url: Optional[str] = None


@get("/history-names-on-article-rank-summary")
async def get_history_names_on_article_rank_summary_handler(user_name: str) -> Response:
    url_query = await ARTICLE_FP_RANK_COLLECTION.find_one({"author.name": user_name})
    if not url_query:
        return success(
            data=GetHistoryNamesOnArticleRankSummaryResponse(
                history_names_onrank_summary={},
            )
        )

    user_url = url_query["author"]["url"]

    result = ARTICLE_FP_RANK_COLLECTION.aggregate(
        [
            {
                "$match": {
                    "author.url": user_url,
                },
            },
            {
                "$group": {
                    "_id": "$author.name",
                    "count": {"$sum": 1},
                }
            },
            # 排除当前昵称
            {
                "$match": {
                    "_id": {
                        "$ne": user_name,
                    },
                },
            },
        ]
    )

    history_names_onrank_summary: Dict[str, int] = {}
    async for item in result:
        history_names_onrank_summary[item["_id"]] = item["count"]

    return success(
        data=GetHistoryNamesOnArticleRankSummaryResponse(
            user_url=user_url,
            history_names_onrank_summary=history_names_onrank_summary,
        )
    )


USERS_ROUTER = Router(
    path="/users",
    route_handlers=[
        get_vip_info_handler,
        get_lottery_win_records,
        get_on_article_rank_records_handler,
        get_on_article_rank_summary_handler,
        get_name_autocomplete_handler,
        get_history_names_on_article_rank_summary_handler,
    ],
)
