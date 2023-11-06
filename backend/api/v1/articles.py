from typing import Annotated, Dict

from JianshuResearchTools.article import GetArticleText, GetArticleTitle
from JianshuResearchTools.convert import ArticleSlugToArticleUrl
from JianshuResearchTools.exceptions import InputError, ResourceError
from litestar import Response, Router, get
from litestar.openapi.spec.example import Example
from litestar.params import Parameter
from msgspec import Struct
from sspeedup.ability.word_split.jieba import AbilityJiebaPossegSplitterV1
from sspeedup.api.code import Code
from sspeedup.api.litestar import RESPONSE_STRUCT_CONFIG, fail, success
from sspeedup.sync_to_async import sync_to_async

from utils.config import config

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


class GetWordFreqResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    title: str
    word_freq: Dict[str, int]


@get(
    "/{article_slug: str}/word-freq",
)
async def get_word_freq_handler(
    article_slug: Annotated[
        str,
        Parameter(
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
        title = await sync_to_async(GetArticleTitle, article_url)
        article_text = await sync_to_async(GetArticleText, article_url)
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

    word_freq = dict((await splitter.get_word_freq(article_text)).most_common(100))

    return success(
        data=GetWordFreqResponse(
            title=title,
            word_freq=word_freq,
        )
    )


# TODO: 实现 LP 理事会推文检测接口

ARTICLES_ROUTER = Router(
    path="/articles",
    route_handlers=[
        get_word_freq_handler,
    ],
)
