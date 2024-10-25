from collections.abc import AsyncGenerator
from enum import Enum
from typing import Optional

from sshared.postgres import Table, create_enum
from sshared.strict_struct import NonEmptyStr

from utils.postgres import jtools_conn


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
    async def _create_enum(cls) -> None:
        await create_enum(conn=jtools_conn, name="enum_tech_stacks_type", enum_class=TypeEnum)
        await create_enum(
            conn=jtools_conn, name="enum_tech_stacks_scope", enum_class=ScopeEnum
        )

    @classmethod
    async def _create_table(cls) -> None:
        await jtools_conn.execute(
            """
            CREATE TABLE IF NOT EXISTS tech_stacks (
                name TEXT NOT NULL CONSTRAINT pk_tech_stacks_name PRIMARY KEY,
                type enum_tech_stacks_type NOT NULL,
                scope enum_tech_stacks_scope NOT NULL,
                is_self_developed BOOLEAN NOT NULL,
                description TEXT NOT NULL,
                url TEXT NOT NULL
            );
            """
        )

    @classmethod
    async def iter(
        cls, scope: Optional[ScopeEnum] = None
    ) -> AsyncGenerator["TechStack", None]:
        if scope:
            cursor = await jtools_conn.execute(
                "SELECT name, type, scope, is_self_developed, "
                "description, url FROM tech_stacks WHERE scope = %s;",
                (scope,),
            )
        else:
            cursor = await jtools_conn.execute(
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
