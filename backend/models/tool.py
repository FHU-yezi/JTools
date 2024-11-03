from enum import Enum
from typing import Optional

from psycopg.types.json import Jsonb
from sshared.postgres import Table, create_enum
from sshared.strict_struct import NonEmptyStr

from utils.db import get_jtools_conn
from utils.log import logger


class StatusEnum(Enum):
    NORMAL = "NORMAL"
    DOWNGRADED = "DOWNGRADED"
    UNAVAILABLE = "UNAVAILABLE"


class Tool(Table, frozen=True):
    slug: NonEmptyStr
    status: StatusEnum
    status_description: Optional[NonEmptyStr]
    data_update_freq: NonEmptyStr
    last_update_time_table: Optional[NonEmptyStr]
    last_update_time_order_by: Optional[NonEmptyStr]
    last_update_time_target_field: Optional[NonEmptyStr]
    data_count_table: Optional[NonEmptyStr]
    data_source: Optional[dict[str, str]]

    @classmethod
    async def _create_enum(cls) -> None:
        conn = await get_jtools_conn()
        await create_enum(conn=conn, name="enum_tools_status", enum_class=StatusEnum)

    @classmethod
    async def _create_table(cls) -> None:
        conn = await get_jtools_conn()
        await conn.execute(
            """
            CREATE TABLE IF NOT EXISTS tools (
                slug TEXT CONSTRAINT pk_tools_slug PRIMARY KEY,
                status enum_tools_status NOT NULL,
                status_description TEXT,
                data_update_freq TEXT NOT NULL,
                last_update_time_table TEXT,
                last_update_time_order_by TEXT,
                last_update_time_target_field TEXT,
                data_count_table TEXT,
                data_source JSONB
            );
            """
        )

    @classmethod
    async def init(cls) -> None:
        await super().init()

        conn = await get_jtools_conn()
        cursor = await conn.execute("SELECT COUNT(*) FROM tools;")
        if (await cursor.fetchone())[0] == 0:  # type: ignore
            # 表为空，填充默认数据
            for tool_slug in TOOL_SLUGS:
                await cls(
                    slug=tool_slug,
                    status=StatusEnum.NORMAL,
                    status_description=None,
                    data_update_freq="未知",
                    last_update_time_table=None,
                    last_update_time_order_by=None,
                    last_update_time_target_field=None,
                    data_count_table=None,
                    data_source=None,
                ).create()

            logger.warn("tools 表为空，已填充默认数据")

    async def create(self) -> None:
        self.validate()
        conn = await get_jtools_conn()
        await conn.execute(
            "INSERT INTO tools (slug, status, status_description, "
            "data_update_freq, last_update_time_table, last_update_time_order_by, "
            "last_update_time_target_field, data_count_table, data_source) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);",
            (
                self.slug,
                self.status,
                self.status_description,
                self.data_update_freq,
                self.last_update_time_table,
                self.last_update_time_order_by,
                self.last_update_time_target_field,
                self.data_count_table,
                Jsonb(self.data_source) if self.data_source else None,
            ),
        )

    @classmethod
    async def get_by_slug(cls, slug: str) -> Optional["Tool"]:
        conn = await get_jtools_conn()
        cursor = await conn.execute(
            "SELECT status, status_description, data_update_freq, "
            "last_update_time_table, last_update_time_order_by, "
            "last_update_time_target_field, data_count_table, data_source "
            "FROM tools WHERE slug = %s;",
            (slug,),
        )
        data = await cursor.fetchone()
        if not data:
            return None

        return cls(
            slug=slug,
            status=data[0],
            status_description=data[1],
            data_update_freq=data[2],
            last_update_time_table=data[3],
            last_update_time_order_by=data[4],
            last_update_time_target_field=data[5],
            data_count_table=data[6],
            data_source=data[7],
        )

    @classmethod
    async def get_tools_slugs_by_status(cls, status: StatusEnum) -> tuple[str, ...]:
        conn = await get_jtools_conn()
        cursor = await conn.execute(
            "SELECT slug FROM tools WHERE status = %s", (status,)
        )
        return tuple(x[0] for x in await cursor.fetchall())


TOOL_SLUGS: tuple[str, ...] = (
    "article-wordcloud-generator",
    "JPEP-FTN-market-analyzer",
    "lottery-analyzer",
    "lottery-reward-record-viewer",
    "LP-recommend-checker",
    "on-rank-article-viewer",
    "URL-scheme-convertor",
    "VIP-info-viewer",
    "VIP-profit-compute",
)
