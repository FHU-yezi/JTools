from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article, set_cache_status
from sanic import Blueprint, HTTPResponse, Request
from sspeedup.api import CODE, sanic_response_json
from sspeedup.time_helper import human_readable_td_to_now, is_datetime_equal

from utils.inject_data_model import inject_data_model
from utils.pydantic_base import BaseModel

set_cache_status(False)

article_publish_time_viewer_blueprint = Blueprint(
    "article_publish_time_viewer", url_prefix="/article_publish_time_viewer"
)


class ArticleDataRequest(BaseModel):
    article_url: str


class ArticleDataResponse(BaseModel):
    title: str
    is_updated: bool
    publish_time: int
    publish_time_to_now_human_readable: str
    update_time: int
    update_time_to_now_human_readable: str


@article_publish_time_viewer_blueprint.post("/article_data")
@inject_data_model(ArticleDataRequest)
def hello_handler(request: Request, data: ArticleDataRequest) -> HTTPResponse:
    del request

    if not data.article_url:
        return sanic_response_json(code=CODE.BAD_ARGUMENTS, message="article_url 不能为空")

    try:
        article = Article.from_url(data.article_url)
    except InputError:
        return sanic_response_json(
            code=CODE.BAD_ARGUMENTS, message="article_url 不是有效的简书文章链接"
        )
    except ResourceError:
        return sanic_response_json(
            code=CODE.BAD_ARGUMENTS, message="article_url 对应的简书文章已被删除 / 锁定"
        )

    title = article.title
    publish_time = article.publish_time
    publish_time_to_now_human_readable = human_readable_td_to_now(publish_time)
    update_time = article.update_time
    update_time_to_now_human_readable = human_readable_td_to_now(update_time)
    is_updated = not is_datetime_equal(publish_time, update_time)

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=ArticleDataResponse(
            title=title,
            is_updated=is_updated,
            publish_time=publish_time.timestamp(),
            publish_time_to_now_human_readable=publish_time_to_now_human_readable,
            update_time=update_time.timestamp(),
            update_time_to_now_human_readable=update_time_to_now_human_readable,
        ).dict(),
    )
