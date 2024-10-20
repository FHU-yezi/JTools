from datetime import datetime

from jkit.msgspec_constraints import (
    NonEmptyStr,
    PositiveInt,
    UserSlug,
)
from sshared.mongo import Document, Index

from utils.mongo import JIANSHU_DB


class LotteryWinRecordDocument(Document, frozen=True):
    id: PositiveInt
    time: datetime
    award_name: NonEmptyStr

    user_slug: UserSlug

    class Meta:  # type: ignore
        collection = JIANSHU_DB.lottery_win_records
        indexes = (Index(keys=("id",), unique=True),)
