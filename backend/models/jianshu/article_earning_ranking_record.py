from datetime import datetime
from typing import Optional

from bson import ObjectId
from jkit.msgspec_constraints import (
    ArticleSlug,
    NonEmptyStr,
    PositiveFloat,
    PositiveInt,
    UserSlug,
)
from sshared.mongo import MODEL_META, Document, Field, Index

from utils.db import JIANSHU_DB


class ArticleField(Field, **MODEL_META):
    slug: Optional[ArticleSlug]
    title: Optional[NonEmptyStr]


class EarningField(Field, **MODEL_META):
    to_author: PositiveFloat
    to_voter: PositiveFloat


class ArticleEarningRankingRecordDocument(Document, **MODEL_META):
    _id: ObjectId
    date: datetime
    ranking: PositiveInt

    article: ArticleField
    author_slug: Optional[UserSlug]
    earning: EarningField

    class Meta:  # type: ignore
        collection = JIANSHU_DB.article_earning_ranking_records
        indexes = (Index(keys=("date", "ranking"), unique=True).validate(),)
