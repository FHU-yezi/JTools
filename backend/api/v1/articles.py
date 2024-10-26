from collections import Counter
from datetime import date, datetime, timedelta
from typing import Annotated, Optional

from jkit.article import Article
from jkit.constants import ARTICLE_SLUG_REGEX
from jkit.exceptions import ResourceUnavailableError
from litestar import Response, Router, get
from litestar.openapi.spec.example import Example
from litestar.params import Parameter
from litestar.status_codes import HTTP_400_BAD_REQUEST
from msgspec import Struct, field
from sshared.word_split import WordSplitter
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
from utils.config import CONFIG

splitter = WordSplitter(
    access_key_id=CONFIG.word_split_access_key.access_key_id,
    access_key_secret=CONFIG.word_split_access_key.access_key_secret,
)


async def get_earliest_can_recommend_date(author_slug: str) -> Optional[date]:
    counted_article_slugs = set()

    latest_onrank_record = await ArticleEarningRankingRecord.get_latest_record(
        author_slug=author_slug, minimum_ranking=85
    )
    if not latest_onrank_record:
        return None

    interval_days = 10 if latest_onrank_record.ranking <= 30 else 7
    counted_article_slugs.add(latest_onrank_record.slug)

    now_record = latest_onrank_record
    while True:
        pervious_record = await ArticleEarningRankingRecord.get_pervious_record(
            base_record=now_record, minimum_ranking=85
        )
        if not pervious_record:
            return latest_onrank_record.date + timedelta(days=interval_days)
        if pervious_record.slug in counted_article_slugs:
            now_record = pervious_record
            continue

        counted_article_slugs.add(pervious_record.slug)

        if (
            now_record.ranking <= 30
            and (now_record.date - pervious_record.date).days + 1 >= 10
        ) or (
            now_record.ranking > 30
            and (now_record.date - pervious_record.date).days + 1 >= 7
        ):
            return latest_onrank_record.date + timedelta(days=interval_days)

        if pervious_record.ranking <= 30:
            interval_days += 10
        else:
            interval_days += 7

        now_record = pervious_record


class GetWordFreqResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    title: str
    word_freq: dict[str, int]


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
            description="文章 Slug",
            pattern=ARTICLE_SLUG_REGEX.pattern,
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
        article = Article.from_slug(article_slug)
        await article.check()
    except ValueError:
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="文章 Slug 无效",
        )
    except ResourceUnavailableError:
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="文章不存在或已被锁定 / 私密 / 删除",
        )

    article_info = await article.info
    title = article_info.title
    text = article_info.text_content

    word_freq = dict(Counter(await splitter.split(text)).most_common(100))

    return success(
        data=GetWordFreqResponse(
            title=title,
            word_freq=word_freq,
        )
    )


class GetLPRecommendCheckResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    article_title: str
    can_recommend_now: bool
    FP_reward: float = field(name="FPReward")
    next_can_recommend_date: Optional[datetime]


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
            description="文章 Slug",
            pattern=ARTICLE_SLUG_REGEX.pattern,
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
        article = Article.from_slug(article_slug)
        await article.check()
    except ValueError:
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="文章 Slug 无效",
        )
    except ResourceUnavailableError:
        return fail(
            http_code=HTTP_400_BAD_REQUEST,
            api_code=Code.BAD_ARGUMENTS,
            msg="文章不存在或已被锁定 / 私密 / 删除",
        )

    article_info = await article.info

    author_slug = article_info.author_info.to_user_obj().slug
    article_title = article_info.title
    article_fp_reward = article_info.earned_fp_amount
    article_next_can_recommend_date = await get_earliest_can_recommend_date(author_slug)

    can_recommend_now = article_fp_reward < 35 and (
        not article_next_can_recommend_date
        or article_next_can_recommend_date <= datetime.now().date()
    )

    return success(
        data=GetLPRecommendCheckResponse(
            article_title=article_title,
            can_recommend_now=can_recommend_now,
            FP_reward=article_fp_reward,
            # TODO
            next_can_recommend_date=datetime(
                year=article_next_can_recommend_date.year,
                month=article_next_can_recommend_date.month,
                day=article_next_can_recommend_date.day,
            )
            if article_next_can_recommend_date
            else None,
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
