from datetime import datetime
from enum import Enum
from typing import List, Optional

from jkit.msgspec_constraints import PositiveInt, UserName, UserSlug, UserUploadedUrl
from sshared.mongo import MODEL_META, Document, Index

from utils.db import JIANSHU_DB


class JianshuUserStatus(Enum):
    NORMAL = "NORMAL"
    INACCESSABLE = "INACCESSIBLE"


class UserDocument(Document, **MODEL_META):
    slug: UserSlug
    status: JianshuUserStatus
    updated_at: datetime
    id: Optional[PositiveInt]
    name: Optional[UserName]
    history_names: List[UserName]
    avatar_url: Optional[UserUploadedUrl]

    class Meta:  # type: ignore
        collection = JIANSHU_DB.users
        indexes = (
            Index(keys=("slug",), unique=True).validate(),
            Index(keys=("updatedAt",)).validate(),
        )
