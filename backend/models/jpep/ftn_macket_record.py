from datetime import datetime
from typing import Literal

from sshared.postgres import Table
from sshared.strict_struct import NonNegativeInt, PositiveFloat, PositiveInt

from utils.postgres import get_jpep_conn


class FTNMacketRecord(Table, frozen=True):
    fetch_time: datetime
    id: PositiveInt
    price: PositiveFloat
    traded_count: NonNegativeInt
    total_amount: PositiveInt
    traded_amount: NonNegativeInt
    remaining_amount: int
    minimum_trade_amount: PositiveInt

    @classmethod
    async def get_current_price(cls, type: Literal["BUY", "SELL"]) -> float:  # noqa: A002
        conn = await get_jpep_conn()
        if type == "BUY":
            cursor = await conn.execute(
                "SELECT MIN(price) FROM ftn_macket_records "
                "JOIN ftn_orders ON ftn_macket_records.id = ftn_orders.id "
                "WHERE type = 'BUY' AND remaining_amount > 0 "
                "AND fetch_time = (SELECT MAX(fetch_time) FROM ftn_macket_records);"
            )
        else:
            cursor = await conn.execute(
                "SELECT MAX(price) FROM ftn_macket_records "
                "JOIN ftn_orders ON ftn_macket_records.id = ftn_orders.id "
                "WHERE type = 'SELL' AND remaining_amount > 0 "
                "AND fetch_time = (SELECT MAX(fetch_time) FROM ftn_macket_records);"
            )

        return (await cursor.fetchone())[0]  # type: ignore

    @classmethod
    async def get_current_amount(cls, type: Literal["BUY", "SELL"]) -> int:  # noqa: A002
        conn = await get_jpep_conn()
        cursor = await conn.execute(
            "SELECT SUM(remaining_amount) FROM ftn_macket_records "
            "JOIN ftn_orders ON ftn_macket_records.id = ftn_orders.id "
            "WHERE type = %s AND fetch_time = "
            "(SELECT MAX(fetch_time) FROM ftn_macket_records);",
            (type,),
        )

        return (await cursor.fetchone())[0]  # type: ignore

    @classmethod
    async def get_current_amount_distribution(
        cls,
        type: Literal["BUY", "SELL"],  # noqa: A002
        limit: int,
    ) -> dict[float, int]:
        conn = await get_jpep_conn()
        cursor = await conn.execute(
            "SELECT price, SUM(remaining_amount) FROM ftn_macket_records "
            "JOIN ftn_orders ON ftn_macket_records.id = ftn_orders.id "
            "WHERE type = %s AND remaining_amount > 0 AND fetch_time = "
            "(SELECT MAX(fetch_time) FROM ftn_macket_records) "
            "GROUP BY price ORDER BY price LIMIT %s;",
            (type, limit),
        )

        result: dict[float, int] = {}
        async for item in cursor:
            result[item[0]] = item[1]

        return result

    @classmethod
    async def get_price_history(
        cls,
        type: Literal["BUY", "SELL"],  # noqa: A002
        start_time: datetime,
        resolution: Literal["max", "hour", "day"],
    ) -> dict[datetime, float]:
        conn = await get_jpep_conn()
        if type == "BUY":
            if resolution == "max":
                cursor = await conn.execute(
                    "SELECT fetch_time, MIN(price) FROM ftn_macket_records "
                    "JOIN ftn_orders ON ftn_macket_records.id = ftn_orders.id "
                    "WHERE type = 'BUY' AND fetch_time >= %s "
                    "GROUP BY fetch_time ORDER BY fetch_time;",
                    (start_time,),
                )
            else:
                cursor = await conn.execute(
                    "SELECT DATE_TRUNC(%s, fetch_time) AS time, MIN(price) "
                    "FROM ftn_macket_records JOIN ftn_orders "
                    "ON ftn_macket_records.id = ftn_orders.id WHERE type = 'BUY' "
                    "AND fetch_time >= %s GROUP BY time ORDER BY time;",
                    (
                        resolution,
                        start_time,
                    ),
                )
        else:
            if resolution == "max":
                cursor = await conn.execute(
                    "SELECT fetch_time, MAX(price) FROM ftn_macket_records "
                    "JOIN ftn_orders ON ftn_macket_records.id = ftn_orders.id "
                    "WHERE type = 'SELL' AND fetch_time >= %s "
                    "GROUP BY fetch_time ORDER BY fetch_time;",
                    (start_time,),
                )
            else:
                cursor = await conn.execute(
                    "SELECT DATE_TRUNC(%s, fetch_time) AS time, MAX(price) "
                    "FROM ftn_macket_records JOIN ftn_orders "
                    "ON ftn_macket_records.id = ftn_orders.id WHERE type = 'SELL' "
                    "AND fetch_time >= %s GROUP BY time ORDER BY time;",
                    (
                        resolution,
                        start_time,
                    ),
                )

        result: dict[datetime, float] = {}
        async for item in cursor:
            result[item[0]] = item[1]

        return result

    @classmethod
    async def get_amount_history(
        cls,
        type: Literal["BUY", "SELL"],  # noqa: A002
        start_time: datetime,
        resolution: Literal["max", "hour", "day"],
    ) -> dict[datetime, int]:
        conn = await get_jpep_conn()
        if resolution == "max":
            cursor = await conn.execute(
                "SELECT fetch_time, SUM(remaining_amount) FROM ftn_macket_records"
                " JOIN ftn_orders ON ftn_macket_records.id = ftn_orders.id "
                "WHERE type = %s AND fetch_time >= %s GROUP BY fetch_time "
                "ORDER BY fetch_time;",
                (type, start_time),
            )
        else:
            cursor = await conn.execute(
                "SELECT DATE_TRUNC(%s, fetch_time) AS time, AVG(sum)::INTEGER "
                "FROM (SELECT fetch_time, SUM(remaining_amount) "
                "FROM ftn_macket_records JOIN ftn_orders "
                "ON ftn_macket_records.id = ftn_orders.id WHERE type = %s "
                "AND fetch_time >= %s GROUP BY fetch_time) "
                "GROUP BY time ORDER BY time;",
                (
                    resolution,
                    type,
                    start_time,
                ),
            )

        result: dict[datetime, int] = {}
        async for item in cursor:
            result[item[0]] = item[1]

        return result
