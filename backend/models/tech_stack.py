from __future__ import annotations

from collections.abc import AsyncGenerator
from enum import Enum

from sshared.postgres import Table
from sshared.strict_struct import NonEmptyStr

from utils.db import jtools_pool


class TypeEnum(Enum):
    LIBRARY = "LIBRARY"
    EXTERNAL_SERVICE = "EXTERNAL_SERVICE"


class ScopeEnum(Enum):
    FRONTEND = "FRONTEND"
    BACKEND = "BACKEND"
    TOOLCHAIN = "TOOLCHAIN"


class TechStack(Table, frozen=True):
    name: NonEmptyStr
    type: TypeEnum
    scope: ScopeEnum
    is_self_developed: bool
    description: NonEmptyStr
    url: NonEmptyStr

    @classmethod
    async def iter(
        cls, scope: ScopeEnum | None = None
    ) -> AsyncGenerator[TechStack, None]:
        async with jtools_pool.get_conn() as conn:
            if scope:
                cursor = await conn.execute(
                    "SELECT name, type, scope, is_self_developed, "
                    "description, url FROM tech_stacks WHERE scope = %s;",
                    (scope,),
                )
            else:
                cursor = await conn.execute(
                    "SELECT name, type, scope, is_self_developed, "
                    "description, url FROM tech_stacks ORDER BY name;"
                )

            async for item in cursor:
                yield cls(
                    name=item[0],
                    type=item[1],
                    scope=item[2],
                    is_self_developed=item[3],
                    description=item[4],
                    url=item[5],
                )
