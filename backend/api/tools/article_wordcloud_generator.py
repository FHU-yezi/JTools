from typing import Dict

from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article, set_cache_status
from sanic import Blueprint, HTTPResponse, Request
from sspeedup.ability.word_split.jieba import AbilityJiebaPossegSplitterV1
from sspeedup.api import CODE, sanic_response_json

from utils.config import config
from utils.inject_data_model import inject_data_model
from utils.pydantic_base import BaseModel

set_cache_status(False)

splitter = AbilityJiebaPossegSplitterV1(
    host=config.word_split_ability.host,
    port=config.word_split_ability.port,
    allowed_word_types_file="wordcloud_assets/allowed_word_types.txt",
)

article_wordcloud_generator_blueprint = Blueprint(
    "article_wordcloud_generator", url_prefix="/article_wordcloud_generator"
)


class WordFreqDataRequest(BaseModel):
    article_url: str


class WordFreqDataResponse(BaseModel):
    title: str
    word_freq: Dict[str, int]


@article_wordcloud_generator_blueprint.post("/word_freq_data")
@inject_data_model(WordFreqDataRequest)
def word_freq_data_handler(request: Request, data: WordFreqDataRequest) -> HTTPResponse:
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
    word_freq = dict(splitter.get_word_freq(article.text).most_common(50))

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=WordFreqDataResponse(title=title, word_freq=word_freq).dict(),
    )
