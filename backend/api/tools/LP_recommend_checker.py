from collections import namedtuple  # noqa: N999
from datetime import datetime, timedelta
from typing import Callable, List, Tuple, Union

from httpx import Client
from JianshuResearchTools.convert import UserSlugToUserUrl
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article, set_cache_status
from sanic import Blueprint, HTTPResponse, Request
from sspeedup.api import CODE, sanic_response_json
from sspeedup.cache.timeout import timeout_cache

from utils.db import LP_collections_db, article_FP_rank_db
from utils.inject_data_model import inject_data_model_from_body
from utils.pydantic_base import BaseModel

set_cache_status(False)

LP_recommend_checker_blueprint = Blueprint(
    "LP_recommend_checker", url_prefix="/LP_recommend_checker"
)
HTTP_CLIENT = Client()
httpx_get = HTTP_CLIENT.get

CheckResult = namedtuple(
    "CheckResult", ["name", "passed", "limit", "operator", "actual"]
)


@timeout_cache(3600)
def get_author_url(article_obj: Article) -> str:
    response = httpx_get(f"https://www.jianshu.com/asimov/p/{article_obj.slug}")
    data = response.json()
    return UserSlugToUserUrl(data["user"]["slug"])


def wordage_checker(article_obj: Article) -> CheckResult:
    wordage: int = article_obj.wordage
    return CheckResult("字数", wordage >= 800, 800, ">=", wordage)


def reward_checker(article_obj: Article) -> CheckResult:
    reward: float = article_obj.total_FP_count
    return CheckResult("收益", reward < 35.0, 35.0, "<", reward)


def recommend_by_lp_last_7d_checker(article_obj: Article) -> CheckResult:
    author_url: str = get_author_url(article_obj)
    recommend_by_lp_last_7d: int = LP_collections_db.count_documents(
        {
            "author.url": author_url,
            "fetch_date": {
                "$gt": datetime.now() - timedelta(days=7),
            },
        }
    )
    return CheckResult(
        "作者过去 7 天被 LP 理事会推荐次数",
        recommend_by_lp_last_7d == 0,
        0,
        "=",
        recommend_by_lp_last_7d,
    )


def on_rank_last_10d_top30_checker(article_obj: Article) -> CheckResult:
    author_url: str = get_author_url(article_obj)
    on_rank_last_10d_top30: int = article_FP_rank_db.count_documents(
        {
            "author.url": author_url,
            "date": {
                "$gt": datetime.now() - timedelta(days=10),
            },
            "ranking": {
                "$lte": 30,
            },
        }
    )
    return CheckResult(
        "作者过去 10 天前 30 名次数", on_rank_last_10d_top30 == 0, 0, "=", on_rank_last_10d_top30
    )


def on_rank_last_1m_top30_checker(article_obj: Article) -> CheckResult:
    author_url: str = get_author_url(article_obj)
    on_rank_last_1m_top30: int = article_FP_rank_db.count_documents(
        {
            "author.url": author_url,
            "date": {
                "$gt": datetime.now() - timedelta(days=30),
            },
            "ranking": {
                "$lte": 30,
            },
        }
    )
    return CheckResult(
        "作者过去 1 个月前 30 名次数", on_rank_last_1m_top30 <= 2, 2, "<=", on_rank_last_1m_top30
    )


CHECK_FUNCS: Tuple[Callable[[Article], CheckResult], ...] = (
    wordage_checker,
    reward_checker,
    recommend_by_lp_last_7d_checker,
    on_rank_last_10d_top30_checker,
    on_rank_last_1m_top30_checker,
)


class CheckRequest(BaseModel):
    article_url: str


class CheckItem(BaseModel):
    name: str
    item_passed: bool
    limit_value: Union[int, float]
    operator: str
    actual_value: Union[int, float]


class CheckResponse(BaseModel):
    title: str
    release_time: int
    check_passed: bool
    check_items: List[CheckItem]


@LP_recommend_checker_blueprint.post("/check")
@inject_data_model_from_body(CheckRequest)
def check_handler(request: Request, data: CheckRequest) -> HTTPResponse:
    del request

    if not data.article_url:
        return sanic_response_json(code=CODE.BAD_ARGUMENTS, message="请输入文章链接")

    try:
        article = Article.from_url(data.article_url)
    except InputError:
        return sanic_response_json(code=CODE.BAD_ARGUMENTS, message="输入的文章链接无效")
    except ResourceError:
        return sanic_response_json(code=CODE.BAD_ARGUMENTS, message="文章已被私密、锁定或删除")

    title = article.title
    release_time = article.publish_time

    check_passed = True
    check_items: List[CheckItem] = []
    for check_func in CHECK_FUNCS:
        result = check_func(article)

        if not result.passed:
            check_passed = False

        check_items.append(
            CheckItem(
                name=result.name,
                item_passed=result.passed,
                limit_value=result.limit,
                operator=result.operator,
                actual_value=result.actual,
            )
        )

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=CheckResponse(
            title=title,
            release_time=int(release_time.timestamp()),
            check_passed=check_passed,
            check_items=check_items,
        ).model_dump(),
    )
