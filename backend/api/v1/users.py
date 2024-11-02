from datetime import datetime
from typing import Annotated, Literal, Optional

from jkit.constants import USER_SLUG_REGEX
from jkit.exceptions import ResourceUnavailableError
from jkit.identifier_check import is_user_slug
from jkit.identifier_convert import article_slug_to_url, user_slug_to_url
from jkit.user import MembershipEnum, User
from litestar import Response, Router, get
from litestar.params import Parameter
from litestar.status_codes import HTTP_400_BAD_REQUEST
from msgspec import Struct, field
from sspeedup.api.code import Code
from sspeedup.api.litestar import (
    RESPONSE_STRUCT_CONFIG,
    fail,
    generate_response_spec,
    success,
)

from models.jianshu.article_earning_ranking_record import (
    ArticleEarningRankingRecord,
)
from models.jianshu.lottery_win_record import LotteryWinRecord
from models.jianshu.user import User as DbUser


class GetVipInfoResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    user_name: str
    is_vip: bool = field(name="isVIP")
    type: Optional[Literal["铜牌", "银牌", "金牌", "白金"]]
    expire_date: Optional[datetime]


@get(
    "/{user_slug: str}/vip-info",
    summary="获取会员信息",
    responses={
        200: generate_response_spec(GetVipInfoResponse),
        400: generate_response_spec(),
    },
)
async def get_vip_info_handler(
    user_slug: Annotated[
        str, Parameter(description="用户 Slug", pattern=USER_SLUG_REGEX.pattern)
    ],
) -> Response:
    try:
        user = User.from_slug(user_slug)
        await user.check()
    except ValueError:
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="用户 Slug 无效",
        )
    except ResourceUnavailableError:
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="用户不存在或已注销 / 被封禁",
        )

    user_info = await user.info
    user_name = user_info.name
    membership_info = user_info.membership_info

    is_vip = membership_info.type != MembershipEnum.NONE
    type_ = membership_info.type.value.replace("会员", "")
    expire_date = membership_info.expired_at

    return success(
        data=GetVipInfoResponse(
            user_name=user_name,
            is_vip=is_vip,
            type=type_,  # type: ignore
            expire_date=expire_date,
        )
    )


class GetLotteryWinRecordItem(Struct, **RESPONSE_STRUCT_CONFIG):
    time: datetime
    reward_name: str


class GetLotteryWinRecordsResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    records: list[GetLotteryWinRecordItem]


@get(
    "/{user_slug: str}/lottery-win-records",
    summary="获取用户中奖记录",
    responses={
        200: generate_response_spec(GetLotteryWinRecordsResponse),
        400: generate_response_spec(),
    },
)
async def get_lottery_win_records(
    user_slug: Annotated[
        str, Parameter(description="用户 Slug", pattern=USER_SLUG_REGEX.pattern)
    ],
    offset: Annotated[int, Parameter(description="分页偏移", ge=0)] = 0,
    limit: Annotated[int, Parameter(description="结果数量", gt=0, lt=100)] = 20,
    excluded_awards: Annotated[
        Optional[list[str]], Parameter(description="排除奖项列表", max_items=10)
    ] = None,
) -> Response:
    if not is_user_slug(user_slug):
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="用户 Slug 无效",
        )

    records: list[GetLotteryWinRecordItem] = [
        GetLotteryWinRecordItem(time=item.time, reward_name=item.award_name)
        async for item in LotteryWinRecord.iter_by_slug_and_excluded_awards(
            slug=user_slug,
            excluded_awards=excluded_awards if excluded_awards else [],
            offset=offset,
            limit=limit,
        )
    ]

    return success(
        data=GetLotteryWinRecordsResponse(
            records=records,
        )
    )


class GetOnArticleRankRecordItem(Struct, **RESPONSE_STRUCT_CONFIG):
    date: datetime
    ranking: int
    article_title: str
    article_url: str
    FP_reward: float = field(name="FPReward")


class GetOnArticleRankRecordsResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    records: list[GetOnArticleRankRecordItem]


@get(
    "/{user_slug: str}/on-article-rank-records",
    summary="获取用户上榜记录",
    responses={
        200: generate_response_spec(GetOnArticleRankRecordsResponse),
        400: generate_response_spec(),
    },
)
async def get_on_article_rank_records_handler(
    user_slug: Annotated[
        str, Parameter(description="用户 Slug", pattern=USER_SLUG_REGEX.pattern)
    ],
    order_by: Annotated[
        Literal["date", "ranking"], Parameter(description="排序依据")
    ] = "date",
    order_direction: Annotated[
        Literal["asc", "desc"], Parameter(description="排序方向")
    ] = "desc",
    offset: Annotated[int, Parameter(description="分页偏移", ge=0)] = 0,
    limit: Annotated[int, Parameter(description="结果数量", gt=0, lt=100)] = 20,
) -> Response:
    if not is_user_slug(user_slug):
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="用户 Slug 无效",
        )

    records = [
        GetOnArticleRankRecordItem(
            date=datetime(
                year=item.date.year, month=item.date.month, day=item.date.day
            ),
            ranking=item.ranking,
            # TODO
            article_title=item.title,  # type: ignore
            # TODO
            article_url=article_slug_to_url(item.slug),  # type: ignore
            FP_reward=item.author_earning,
        )
        async for item in ArticleEarningRankingRecord.iter_by_author_slug(
            author_slug=user_slug,
            order_by=order_by,
            order_direction=order_direction.upper(),  # type: ignore
            offset=offset,
            limit=limit,
        )
    ]

    return success(
        data=GetOnArticleRankRecordsResponse(
            records=records,
        )
    )


@get(
    "/name/{user_name: str}/on-article-rank-records",
    summary="通过昵称获取用户上榜记录",
    responses={
        200: generate_response_spec(GetOnArticleRankRecordsResponse),
        400: generate_response_spec(),
    },
)
async def get_on_article_rank_records_by_user_name_handler(
    user_name: Annotated[str, Parameter(description="用户昵称", max_length=50)],
    order_by: Annotated[
        Literal["date", "ranking"], Parameter(description="排序依据")
    ] = "date",
    order_direction: Annotated[
        Literal["asc", "desc"], Parameter(description="排序方向")
    ] = "desc",
    offset: Annotated[int, Parameter(description="分页偏移", ge=0)] = 0,
    limit: Annotated[int, Parameter(description="结果数量", gt=0, lt=100)] = 20,
) -> Response:
    user = await DbUser.get_by_name(user_name)
    if not user:  # 没有找到对应昵称的用户
        return success(data=GetOnArticleRankRecordsResponse(records=[]))

    records = [
        GetOnArticleRankRecordItem(
            date=datetime(
                year=item.date.year, month=item.date.month, day=item.date.day
            ),
            ranking=item.ranking,
            # TODO
            article_title=item.title,  # type: ignore
            # TODO
            article_url=article_slug_to_url(item.slug),  # type: ignore
            FP_reward=item.author_earning,
        )
        async for item in ArticleEarningRankingRecord.iter_by_author_slug(
            author_slug=user.slug,
            order_by=order_by,
            order_direction=order_direction.upper(),  # type: ignore
            offset=offset,
            limit=limit,
        )
    ]

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


@get(
    "/{user_slug: str}/on-article-rank-summary",
    summary="获取用户上榜摘要",
    responses={
        200: generate_response_spec(GetOnArticleRankSummaryResponse),
        400: generate_response_spec(),
    },
)
async def get_on_article_rank_summary_handler(
    user_slug: Annotated[
        str, Parameter(description="用户 Slug", pattern=USER_SLUG_REGEX.pattern)
    ],
) -> Response:
    if not is_user_slug(user_slug):
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="用户 Slug 无效",
        )

    top10 = 0
    top30 = 0
    top50 = 0
    total = 0
    async for item in ArticleEarningRankingRecord.iter_by_author_slug(
        author_slug=user_slug,
        order_by="date",
        order_direction="ASC",
        offset=0,
        limit=100000,  # TODO
    ):
        total += 1
        if item.ranking <= 10:
            top10 += 1
        if item.ranking <= 30:
            top30 += 1
        if item.ranking <= 50:
            top50 += 1

    return success(
        data=GetOnArticleRankSummaryResponse(
            top10=top10,
            top30=top30,
            top50=top50,
            total=total,
        )
    )


@get(
    "/name/{user_name: str}/on-article-rank-summary",
    summary="根据昵称获取用户上榜摘要",
    responses={
        200: generate_response_spec(GetOnArticleRankSummaryResponse),
        400: generate_response_spec(),
    },
)
async def get_on_article_rank_summary_by_user_name_handler(
    user_name: Annotated[str, Parameter(description="用户昵称", max_length=50)],
) -> Response:
    user = await DbUser.get_by_name(user_name)
    if not user:  # 没有找到对应昵称的用户
        return success(
            data=GetOnArticleRankSummaryResponse(top10=0, top30=0, top50=0, total=0)
        )

    top10 = 0
    top30 = 0
    top50 = 0
    total = 0
    async for item in ArticleEarningRankingRecord.iter_by_author_slug(
        author_slug=user.slug,
        order_by="date",
        order_direction="ASC",
        offset=0,
        limit=100000,  # TODO
    ):
        total += 1
        if item.ranking <= 10:
            top10 += 1
        if item.ranking <= 30:
            top30 += 1
        if item.ranking <= 50:
            top50 += 1

    return success(
        data=GetOnArticleRankSummaryResponse(
            top10=top10,
            top30=top30,
            top50=top50,
            total=total,
        )
    )


class GetNameAutocompleteResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    names: list[str]


@get(
    "/name-autocomplete",
    summary="获取用户昵称自动补全",
    responses={
        200: generate_response_spec(GetNameAutocompleteResponse),
    },
)
async def get_name_autocomplete_handler(
    name_part: Annotated[str, Parameter(description="用户昵称片段", max_length=50)],
    limit: Annotated[int, Parameter(description="结果数量", gt=0, le=100)] = 5,
) -> Response:
    result = [item async for item in DbUser.iter_similar_names(name_part, limit=limit)]

    return success(
        data=GetNameAutocompleteResponse(
            names=result,
        )
    )


class GetHistoryNamesOnArticleRankSummaryResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    history_names_onrank_summary: dict[str, int]
    user_url: Optional[str] = None


@get(
    "/name/{user_name: str}/history-names-on-article-rank-summary",
    summary="获取用户曾用昵称上榜摘要",
    responses={
        200: generate_response_spec(GetHistoryNamesOnArticleRankSummaryResponse),
    },
)
async def get_history_names_on_article_rank_summary_handler(
    user_name: Annotated[str, Parameter(description="用户昵称", max_length=50)],
) -> Response:
    user = await DbUser.get_by_name(user_name)
    if not user:  # 没有找到对应昵称的用户
        return success(
            data=GetHistoryNamesOnArticleRankSummaryResponse(
                history_names_onrank_summary={},
            )
        )

    history_names = user.history_names

    return success(
        data=GetHistoryNamesOnArticleRankSummaryResponse(
            user_url=user_slug_to_url(user.slug),
            # TODO: 全部曾上榜昵称均显示为 1 条记录
            history_names_onrank_summary={x: 1 for x in history_names},
        )
    )


USERS_ROUTER = Router(
    path="/users",
    route_handlers=[
        get_vip_info_handler,
        get_lottery_win_records,
        get_on_article_rank_records_handler,
        get_on_article_rank_records_by_user_name_handler,
        get_on_article_rank_summary_handler,
        get_on_article_rank_summary_by_user_name_handler,
        get_name_autocomplete_handler,
        get_history_names_on_article_rank_summary_handler,
    ],
    tags=["用户"],
)
