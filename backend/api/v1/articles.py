from asyncio import gather
from datetime import datetime, timedelta
from typing import Annotated, Any, Dict, Optional, cast

from bson import ObjectId
from httpx import AsyncClient
from JianshuResearchTools.article import (
    GetArticleText,
    GetArticleTitle,
    GetArticleTotalFPCount,
)
from JianshuResearchTools.assert_funcs import AssertArticleStatusNormal
from JianshuResearchTools.convert import ArticleSlugToArticleUrl, UserSlugToUserUrl
from JianshuResearchTools.exceptions import InputError, ResourceError
from litestar import Response, Router, get
from litestar.openapi.spec.example import Example
from litestar.params import Parameter
from litestar.status_codes import HTTP_400_BAD_REQUEST
from msgspec import Struct, field
from sspeedup.ability.word_split.jieba import AbilityJiebaPossegSplitterV1
from sspeedup.api.code import Code
from sspeedup.api.litestar import (
    RESPONSE_STRUCT_CONFIG,
    fail,
    generate_response_spec,
    success,
)
from sspeedup.sync_to_async import sync_to_async

from utils.config import config
from utils.db import ARTICLE_FP_RANK_COLLECTION

CLIENT = AsyncClient(http2=True)

# fmt: off
splitter = AbilityJiebaPossegSplitterV1(
    host=config.ability_word_split.host,
    port=config.ability_word_split.port,
    allowed_word_types={
        "Ag", "a", "ad", "an", "dg", "g", "i",
        "j", "l", "Ng", "n", "nr", "ns", "nt",
        "nz","tg","vg","v","vd","vn","un",
    },
)
# fmt: on


async def get_author_url(article_slug: str) -> str:
    response = await CLIENT.get(f"https://www.jianshu.com/asimov/p/{article_slug}")
    response.raise_for_status()

    json = response.json()
    return UserSlugToUserUrl(json["user"]["slug"])


async def get_latest_onrank_record(
    author_url: str, *, minimum_ranking: Optional[int] = None
) -> Optional[Dict[str, Any]]:
    cursor = (
        ARTICLE_FP_RANK_COLLECTION.find(
            {
                "author.url": author_url,
                "ranking": {
                    "$lte": minimum_ranking if minimum_ranking else 100,
                },
            }
        )
        .sort("date", -1)
        .limit(1)
    )

    try:
        return await cursor.next()
    except StopAsyncIteration:
        return None


async def get_pervious_onrank_record(
    onrank_record: Dict[str, Any], minimum_ranking: Optional[int] = None
) -> Optional[Dict[str, Any]]:
    cursor = (
        ARTICLE_FP_RANK_COLLECTION.find(
            {
                "_id": {"$lt": ObjectId(onrank_record["_id"])},
                "author.url": onrank_record["author"]["url"],
                "ranking": {
                    "$lte": minimum_ranking if minimum_ranking else 100,
                },
            }
        )
        .sort("_id", -1)
        .limit(1)
    )

    try:
        return await cursor.next()
    except StopAsyncIteration:
        return None


async def caculate_next_can_recommend_date(author_url: str) -> Optional[datetime]:
    counted_article_urls = set()

    latest_onrank_record = await get_latest_onrank_record(
        author_url, minimum_ranking=85
    )
    if not latest_onrank_record:
        # 作者没有上榜文章，或全部上榜文章均低于 85 名
        return None

    interval_days = 10 if latest_onrank_record["ranking"] <= 30 else 7
    counted_article_urls.add(latest_onrank_record["article"]["url"])

    now_record = latest_onrank_record
    while True:
        pervious_record = await get_pervious_onrank_record(
            now_record, minimum_ranking=85
        )
        if not pervious_record:
            # 没有更多文章
            return cast(datetime, now_record["date"]) + timedelta(days=interval_days)
        if pervious_record["article"]["url"] in counted_article_urls:
            # 该文章之前计算过间隔
            now_record = pervious_record
            continue

        counted_article_urls.add(pervious_record["article"]["url"])

        if (
            now_record["ranking"] <= 30
            and (now_record["date"] - pervious_record["date"]).days > 10
        ) or (
            now_record["ranking"] > 30
            and (now_record["date"] - pervious_record["date"]).days > 7
        ):
            return cast(datetime, now_record["date"]) + timedelta(days=interval_days)

        if pervious_record["ranking"] <= 30:
            interval_days += 10
        else:
            interval_days += 7

        now_record = pervious_record


class GetWordFreqResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    title: str
    word_freq: Dict[str, int]


@get(
    "/{article_slug: str}/word-freq",
    summary="获取文章词频",
    responses={
        200: generate_response_spec(GetWordFreqResponse),
        400: generate_response_spec(),
    },
)
async def get_word_freq_handler(
    article_slug: Annotated[
        str,
        Parameter(
            description="文章 slug",
            min_length=12,
            max_length=12,
            examples=[
                Example(
                    summary="简书导航 一文助你玩转简书 - LP 理事会",
                    value="088f7eed2ca3",
                )
            ],
        ),
    ],
) -> Response:
    try:
        article_url = ArticleSlugToArticleUrl(article_slug)
        title, article_text = await gather(
            sync_to_async(GetArticleTitle, article_url),
            sync_to_async(GetArticleText, article_url),
        )
    except InputError:
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="输入的文章链接无效",
        )
    except ResourceError:
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="文章已被删除、锁定或正在审核中",
        )

    word_freq = dict((await splitter.get_word_freq(article_text)).most_common(100))

    return success(
        data=GetWordFreqResponse(
            title=title,
            word_freq=word_freq,
        )
    )


class GetLPRecommendCheckResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    article_title: str
    FP_reward: float = field(name="FPReward")
    next_can_recommend_date: Optional[datetime]


# TODO: 实现 LP 理事会推文检测接口
@get(
    "/{article_slug: str}/lp-recommend-check",
    summary="获取 LP 理事会推文检测结果",
    responses={
        200: generate_response_spec(GetLPRecommendCheckResponse),
        400: generate_response_spec(),
    },
)
async def get_LP_recommend_check_handler(  # noqa: N802
    article_slug: Annotated[
        str,
        Parameter(
            description="文章 slug",
            min_length=12,
            max_length=12,
            examples=[
                Example(
                    summary="简书导航 一文助你玩转简书 - LP 理事会",
                    value="088f7eed2ca3",
                )
            ],
        ),
    ],
) -> Response:
    try:
        article_url = ArticleSlugToArticleUrl(article_slug)
        await sync_to_async(AssertArticleStatusNormal, article_url)
    except InputError:
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="输入的文章链接无效",
        )
    except ResourceError:
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="文章已被删除、锁定或正在审核中",
        )

    author_url = await get_author_url(article_slug)

    next_can_recommend_date, article_title, FP_reward = await gather(  # noqa: N806
        caculate_next_can_recommend_date(author_url),
        sync_to_async(GetArticleTitle, article_url),
        sync_to_async(GetArticleTotalFPCount, article_url),
    )

    return success(
        data=GetLPRecommendCheckResponse(
            article_title=article_title,
            FP_reward=FP_reward,
            next_can_recommend_date=next_can_recommend_date,
        )
    )


ARTICLES_ROUTER = Router(
    path="/articles",
    route_handlers=[
        get_word_freq_handler,
        get_LP_recommend_check_handler,
    ],
    tags=["文章"],
)
