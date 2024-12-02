from __future__ import annotations

from collections.abc import AsyncGenerator
from datetime import datetime
from enum import Enum

from sshared.postgres import Table
from sshared.strict_struct import NonEmptyStr, PositiveInt

from utils.db import jianshu_pool


class StatusEnum(Enum):
    NORMAL = "NORMAL"
    INACCESSIBLE = "INACCESSIBLE"


class User(Table, frozen=True):
    slug: NonEmptyStr
    status: StatusEnum
    update_time: datetime
    id: PositiveInt | None
    name: NonEmptyStr | None
    history_names: list[NonEmptyStr]
    avatar_url: NonEmptyStr | None

    @classmethod
    async def get_by_slug(cls, slug: str) -> User | None:
        async with jianshu_pool.get_conn() as conn:
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
    async def get_by_name(cls, name: str) -> User | None:
        async with jianshu_pool.get_conn() as conn:
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
    async def iter_similar_names(cls, name: str, limit: int) -> AsyncGenerator[str]:
        async with jianshu_pool.get_conn() as conn:
            cursor = await conn.execute(
                "SELECT users.name, COUNT(*) FROM users "
                "JOIN article_earning_ranking_records ON users.slug = "
                "article_earning_ranking_records.author_slug "
                "WHERE users.name LIKE %s GROUP BY users.name "
                "ORDER BY count DESC LIMIT %s;",
                (f"{name}%", limit),
            )

            async for item in cursor:
                yield item[0]
