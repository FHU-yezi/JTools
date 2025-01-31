from __future__ import annotations

from datetime import datetime

from psycopg import sql

from models.tool import Tool
from utils.db import jianshu_pool, jpep_pool


async def get_last_update_time(tool_slug: str) -> datetime | None:
    tool = await Tool.get_by_slug(tool_slug)
    if (
        not tool
        or not tool.last_update_time_target_field
        or not tool.last_update_time_table
        or not tool.last_update_time_order_by
    ):
        return None

    # TODO
    pool = jpep_pool if tool_slug == "JPEP-FTN-market-analyzer" else jianshu_pool
    async with pool.get_conn() as conn:
        cursor = await conn.execute(
            sql.SQL("SELECT {} FROM {} ORDER BY {} DESC LIMIT 1;").format(
                sql.Identifier(tool.last_update_time_target_field),
                sql.Identifier(tool.last_update_time_table),
                sql.Identifier(tool.last_update_time_order_by),
            )
        )

        data = await cursor.fetchone()
    if not data:  # 数据库中没有数据
        return None

    return data[0]


async def get_data_count(tool_slug: str) -> int | None:
    tool = await Tool.get_by_slug(tool_slug)
    if not tool or not tool.data_count_table:
        return None

    # TODO
    pool = jpep_pool if tool_slug == "JPEP-FTN-market-analyzer" else jianshu_pool
    async with pool.get_conn() as conn:
        cursor = await conn.execute(
            sql.SQL("SELECT COUNT(*) FROM {};").format(
                sql.Identifier(tool.data_count_table)
            )
        )

        data = await cursor.fetchone()

    return data[0]  # type: ignore
