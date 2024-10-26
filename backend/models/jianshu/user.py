from datetime import datetime
from enum import Enum
from typing import Optional

from sshared.postgres import Table, create_enum
from sshared.strict_struct import NonEmptyStr, PositiveInt

from utils.postgres import get_jianshu_conn


class StatusEnum(Enum):
    NORMAL = "NORMAL"
    INACCESSIBLE = "INACCESSIBLE"


class User(Table, frozen=True):
    slug: NonEmptyStr
    status: StatusEnum
    update_time: datetime
    id: Optional[PositiveInt]
    name: Optional[NonEmptyStr]
    history_names: list[NonEmptyStr]
    avatar_url: Optional[NonEmptyStr]

    @classmethod
    async def _create_enum(cls) -> None:
        conn = await get_jianshu_conn()
        await create_enum(conn=conn, name="enum_users_status", enum_class=StatusEnum)

    @classmethod
    async def get_by_slug(cls, slug: str) -> Optional["User"]:
        conn = await get_jianshu_conn()
        cursor = await conn.execute(
            "SELECT status, update_time, id, name, history_names, "
            "avatar_url FROM users WHERE slug = %s;",
            (slug,),
        )

        data = await cursor.fetchone()
        if not data:
            return None

        return cls(
            slug=slug,
            status=data[0],
            update_time=data[1],
            id=data[2],
            name=data[3],
            history_names=data[4],
            avatar_url=data[5],
        )

    @classmethod
    async def get_by_name(cls, name: str) -> Optional["User"]:
        conn = await get_jianshu_conn()
        cursor = await conn.execute(
            "SELECT slug, status, update_time, id, history_names, "
            "avatar_url FROM users WHERE name = %s;",
            (name,),
        )

        data = await cursor.fetchone()
        if not data:
            return None

        return cls(
            slug=data[0],
            status=data[1],
            update_time=data[2],
            id=data[3],
            name=name,
            history_names=data[4],
            avatar_url=data[5],
        )

    @classmethod
    async def get_similar_names(cls, name: str, limit: int) -> list[str]:
        conn = await get_jianshu_conn()
        cursor = await conn.execute(
            "SELECT name FROM users WHERE name LIKE %s LIMIT %s;",
            (f"{name}%", limit),
        )

        data = await cursor.fetchall()
        return [x[0] for x in data]
