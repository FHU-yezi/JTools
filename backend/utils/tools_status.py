from datetime import datetime
from typing import Optional

from psycopg import sql

from models.jpep.ftn_trade_order import FTNTradeOrderDocument
from models.tool import Tool
from utils.postgres import get_jianshu_conn


async def get_last_update_time(tool_slug: str) -> Optional[datetime]:
    tool = await Tool.get_by_slug(tool_slug)
    if (
        not tool
        or not tool.last_update_time_target_field
        or not tool.last_update_time_table
        or not tool.last_update_time_order_by
    ):
        return None

    if tool_slug != "JPEP-FTN-market-analyzer":
        conn = await get_jianshu_conn()
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

    # 旧版数据库只剩下一个，故硬编码 collection
    latest_record = await FTNTradeOrderDocument.find_one(
        sort={tool.last_update_time_order_by: "DESC"}  # type: ignore
    )

    # 获取到的是数据记录对象，将其转换为字典
    # 然后通过驼峰样式的 sort_key 获取到数据更新时间
    return (
        latest_record.to_dict()[tool.last_update_time_target_field]  # type: ignore
        if latest_record
        else None
    )


async def get_data_count(tool_slug: str) -> Optional[int]:
    tool = await Tool.get_by_slug(tool_slug)
    if not tool or not tool.data_count_table:
        return None

    if tool_slug != "JPEP-FTN-market-analyzer":
        conn = await get_jianshu_conn()
        cursor = await conn.execute(
            sql.SQL("SELECT COUNT(*) FROM {};").format(
                sql.Identifier(tool.data_count_table)
            )
        )

        data = await cursor.fetchone()

        return data[0]  # type: ignore

    # 旧版数据库只剩下一个，故硬编码 collection
    return await FTNTradeOrderDocument.count(fast=True)
