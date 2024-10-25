from datetime import datetime, timedelta
from typing import Optional

from sshared.postgres import Table
from sshared.strict_struct import NonEmptyStr, PositiveInt
from sspeedup.time_helper import get_start_time

from utils.postgres import jianshu_conn

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
    async def get_by_excluded_awards(
        cls, excluded_awards: list[str], offset: int, limit: int
    ) -> list["LotteryWinRecord"]:
        cursor = await jianshu_conn.execute(
            "SELECT id, time, user_slug, award_name FROM lottery_win_records "
            "WHERE award_name != ALL(%s) ORDER BY time DESC OFFSET %s LIMIT %s;",
            (excluded_awards, offset, limit),
        )

        data = await cursor.fetchall()
        return [
            cls(
                id=item[0],
                time=item[1],
                user_slug=item[2],
                award_name=item[3],
            )
            for item in data
        ]

    @classmethod
    async def get_by_slug_and_excluded_awards(
        cls, slug: str, excluded_awards: list[str], offset: int, limit: int
    ) -> list["LotteryWinRecord"]:
        cursor = await jianshu_conn.execute(
            "SELECT id, time, award_name FROM lottery_win_records "
            "WHERE slug = %s AND award_name != ALL(%s) "
            "ORDER BY time DESC OFFSET %s LIMIT %s;",
            (slug, excluded_awards, offset, limit),
        )

        data = await cursor.fetchall()
        return [
            cls(
                id=item[0],
                time=item[1],
                user_slug=slug,
                award_name=item[2],
            )
            for item in data
        ]

    @classmethod
    async def get_summary_wins_count(cls, td: Optional[timedelta]) -> dict[str, int]:
        if td:
            cursor = await jianshu_conn.execute(
                "SELECT award_name, COUNT(*) FROM lottery_win_records "
                "WHERE time >= %s GROUP BY award_name;",
                (get_start_time(td),),
            )
        else:
            cursor = await jianshu_conn.execute(
                "SELECT award_name, COUNT(*) FROM lottery_win_records "
                "GROUP BY award_name;"
            )

        data = await cursor.fetchall()

        result = {key: 0 for key in REWARD_NAMES}
        result.update({item[0]: item[1] for item in data})
        return result

    @classmethod
    async def get_summary_winners_count(cls, td: Optional[timedelta]) -> dict[str, int]:
        if td:
            cursor = await jianshu_conn.execute(
                "SELECT award_name, COUNT(DISTINCT user_slug) "
                "FROM lottery_win_records WHERE time >= %s "
                "GROUP BY award_name;",
                (get_start_time(td),),
            )
        else:
            cursor = await jianshu_conn.execute(
                "SELECT award_name, COUNT(DISTINCT user_slug) "
                "FROM lottery_win_records GROUP BY award_name;",
            )

        data = await cursor.fetchall()

        result = {key: 0 for key in REWARD_NAMES}
        result.update({item[0]: item[1] for item in data})
        return result

    @classmethod
    async def get_wins_history(
        cls, td: timedelta, resolution: str
    ) -> dict[datetime, int]:
        if resolution == "1h":
            cursor = await jianshu_conn.execute(
                "SELECT DATE_TRUNC('hour', time) AS time, COUNT(*) "
                "FROM lottery_win_records WHERE time >= %s "
                "GROUP BY DATE_TRUNC('hour', time);",
                (get_start_time(td),),
            )
        elif resolution == "1d":
            cursor = await jianshu_conn.execute(
                "SELECT DATE_TRUNC('day', time) AS time, COUNT(*) "
                "FROM lottery_win_records WHERE time >= %s "
                "GROUP BY DATE_TRUNC('day', time);",
                (get_start_time(td),),
            )
        else:
            raise ValueError(f"错误的 resolution 取值：{resolution}")

        data = await cursor.fetchall()

        return {item[0]: item[1] for item in data}
