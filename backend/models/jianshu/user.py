from datetime import datetime
from enum import Enum
from typing import Optional

from jkit.msgspec_constraints import PositiveInt, UserName, UserSlug, UserUploadedUrl
from sshared.mongo import Document, Index

from utils.db import JIANSHU_DB


class JianshuUserStatus(Enum):
    NORMAL = "NORMAL"
    INACCESSABLE = "INACCESSIBLE"


class UserDocument(Document, frozen=True):
    slug: UserSlug
    status: JianshuUserStatus
    updated_at: datetime
    id: Optional[PositiveInt]
    name: Optional[UserName]
    history_names: list[UserName]
    avatar_url: Optional[UserUploadedUrl]

    class Meta:  # type: ignore
        collection = JIANSHU_DB.users
        indexes = (
            Index(keys=("slug",), unique=True).validate(),
            Index(keys=("updatedAt",)).validate(),
        )
