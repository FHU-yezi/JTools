from collections.abc import AsyncGenerator
from datetime import date

from sshared.postgres import Table
from sshared.strict_struct import NonEmptyStr, PositiveInt

from utils.db import jtools_pool


class DebugProjectRecord(Table, frozen=True):
    id: PositiveInt
    date: date
    type: NonEmptyStr
    module: NonEmptyStr
    description: NonEmptyStr
    user_name: NonEmptyStr
    user_slug: NonEmptyStr
    reward: PositiveInt

    @classmethod
    async def iter(cls) -> AsyncGenerator["DebugProjectRecord", None]:
        async with jtools_pool.get_conn() as conn:
            cursor = await conn.execute(
                "SELECT id, date, type, module, description, user_name, "
                "user_slug, reward FROM debug_project_records ORDER BY date DESC;"
            )

            async for item in cursor:
                yield cls(
                    id=item[0],
                    date=item[1],
                    type=item[2],
                    module=item[3],
                    description=item[4],
                    user_name=item[5],
                    user_slug=item[6],
                    reward=item[7],
                )
