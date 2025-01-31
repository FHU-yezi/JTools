from __future__ import annotations

from collections.abc import AsyncGenerator
from datetime import datetime, timedelta

from sshared.postgres import Table
from sshared.strict_struct import NonEmptyStr, PositiveInt
from sspeedup.time_helper import get_start_time

from utils.db import jianshu_pool

REWARD_NAMES: tuple[str, ...] = (
    "收益加成卡100",
    "收益加成卡1万",
    "四叶草徽章",
    "锦鲤头像框1年",
)


class LotteryWinRecord(Table, frozen=True):
    id: PositiveInt
    time: datetime
    user_slug: NonEmptyStr
    award_name: NonEmptyStr

    @classmethod
    async def iter_by_excluded_awards(
        cls, excluded_awards: list[str], offset: int, limit: int
    ) -> AsyncGenerator[LotteryWinRecord]:
        async with jianshu_pool.get_conn() as conn:
            cursor = await conn.execute(
                "SELECT id, time, user_slug, award_name FROM lottery_win_records "
                "WHERE award_name != ALL(%s) ORDER BY time DESC OFFSET %s LIMIT %s;",
                (excluded_awards, offset, limit),
            )

            async for item in cursor:
                yield cls(
                    id=item[0],
                    time=item[1],
                    user_slug=item[2],
                    award_name=item[3],
                )

    @classmethod
    async def iter_by_slug_and_excluded_awards(
        cls, slug: str, excluded_awards: list[str], offset: int, limit: int
    ) -> AsyncGenerator[LotteryWinRecord]:
        async with jianshu_pool.get_conn() as conn:
            cursor = await conn.execute(
                "SELECT id, time, award_name FROM lottery_win_records "
                "WHERE user_slug = %s AND award_name != ALL(%s) "
                "ORDER BY time DESC OFFSET %s LIMIT %s;",
                (slug, excluded_awards, offset, limit),
            )

            async for item in cursor:
                yield cls(
                    id=item[0],
                    time=item[1],
                    user_slug=slug,
                    award_name=item[2],
                )

    @classmethod
    async def get_summary_wins_count(cls, td: timedelta | None) -> dict[str, int]:
        async with jianshu_pool.get_conn() as conn:
            if td:
                cursor = await conn.execute(
                    "SELECT award_name, COUNT(*) FROM lottery_win_records "
                    "WHERE time >= %s GROUP BY award_name;",
                    (get_start_time(td),),
                )
            else:
                cursor = await conn.execute(
                    "SELECT award_name, COUNT(*) FROM lottery_win_records "
                    "GROUP BY award_name;"
                )

            result = {key: 0 for key in REWARD_NAMES}
            result.update({item[0]: item[1] async for item in cursor})
        return result

    @classmethod
    async def get_summary_winners_count(cls, td: timedelta | None) -> dict[str, int]:
        async with jianshu_pool.get_conn() as conn:
            if td:
                cursor = await conn.execute(
                    "SELECT award_name, COUNT(DISTINCT user_slug) "
                    "FROM lottery_win_records WHERE time >= %s "
                    "GROUP BY award_name;",
                    (get_start_time(td),),
                )
            else:
                cursor = await conn.execute(
                    "SELECT award_name, COUNT(DISTINCT user_slug) "
                    "FROM lottery_win_records GROUP BY award_name;",
                )

            result = {key: 0 for key in REWARD_NAMES}
            result.update({item[0]: item[1] async for item in cursor})
        return result

    @classmethod
    async def get_wins_history(
        cls, td: timedelta, resolution: str
    ) -> dict[datetime, int]:
        async with jianshu_pool.get_conn() as conn:
            if resolution == "1h":
                cursor = await conn.execute(
                    "SELECT DATE_TRUNC('hour', time) AS time, COUNT(*) "
                    "FROM lottery_win_records WHERE time >= %s GROUP BY "
                    "DATE_TRUNC('hour', time) ORDER BY DATE_TRUNC('hour', time);",
                    (get_start_time(td),),
                )
            elif resolution == "1d":
                cursor = await conn.execute(
                    "SELECT DATE_TRUNC('day', time) AS time, COUNT(*) "
                    "FROM lottery_win_records WHERE time >= %s GROUP BY "
                    "DATE_TRUNC('day', time) ORDER BY DATE_TRUNC('day', time);",
                    (get_start_time(td),),
                )
            else:
                raise ValueError(f"错误的 resolution 取值：{resolution}")

            return {item[0]: item[1] async for item in cursor}
