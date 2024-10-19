from enum import Enum
from typing import Optional

from psycopg.types.json import Jsonb
from sshared.postgres import Table, create_enum
from sshared.strict_struct import NonEmptyStr

from utils.log import logger
from utils.postgres import conn


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
        await create_enum(conn=conn, name="enum_tools_status", enum_class=StatusEnum)

    @classmethod
    async def _create_table(cls) -> None:
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

        cursor = await conn.execute("SELECT COUNT(*) FROM tools;")
        if (await cursor.fetchone())[0] == 0:  # type: ignore
            # 表为空，填充默认数据
            for tool in DEFAULT_TOOLS:
                await tool.create()

            logger.warn("tools 表为空，已填充默认数据")

    async def create(self) -> None:
        self.validate()
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
        cursor = await conn.execute(
            "SELECT slug FROM tools WHERE status = %s", (status,)
        )
        return tuple(x[0] for x in await cursor.fetchall())


DEFAULT_TOOLS: tuple[Tool, ...] = (
    Tool(
        slug="article-wordcloud-generator",
        status=StatusEnum.NORMAL,
        status_description=None,
        data_update_freq="实时",
        last_update_time_table=None,
        last_update_time_order_by=None,
        last_update_time_target_field=None,
        data_count_table=None,
        data_source=None,
    ),
    Tool(
        slug="JPEP-FTN-market-analyzer",
        status=StatusEnum.NORMAL,
        status_description=None,
        data_update_freq="十分钟一次",
        last_update_time_table="FTN_trade_orders",
        last_update_time_order_by="fetchTime",
        last_update_time_target_field="fetchTime",
        data_count_table="FTN_trade_orders",
        data_source={"简书积分兑换平台 - 贝市": "https://www.jianshubei.com/bei"},
    ),
    Tool(
        slug="lottery-analyzer",
        status=StatusEnum.DOWNGRADED,
        status_description="受简书运营调整影响，大转盘抽奖已于 2024.4.28 13:20 下线。",
        data_update_freq="十分钟一次",
        last_update_time_table="lottery_win_records",
        last_update_time_order_by="time",
        last_update_time_target_field="time",
        data_count_table="lottery_win_records",
        data_source={"简书 - 天天抽奖": "https://www.jianshu.com/mobile/lottery"},
    ),
    Tool(
        slug="lottery-reward-record-viewer",
        status=StatusEnum.DOWNGRADED,
        status_description="受简书运营调整影响，大转盘抽奖已于 2024.4.28 13:20 下线。",
        data_update_freq="十分钟一次",
        last_update_time_table="lottery_win_records",
        last_update_time_order_by="time",
        last_update_time_target_field="time",
        data_count_table="lottery_win_records",
        data_source={"简书 - 天天抽奖": "https://www.jianshu.com/mobile/lottery"},
    ),
    Tool(
        slug="LP-recommend-checker",
        status=StatusEnum.DOWNGRADED,
        status_description=(
            "受简书运营调整影响，LP 理事会超级权重不再发放，故取消相关推文限制。"
        ),
        data_update_freq="实时",
        last_update_time_table=None,
        last_update_time_order_by=None,
        last_update_time_target_field=None,
        data_count_table=None,
        data_source={
            "简书 - 专题 - 理事会点赞汇总": "https://www.jianshu.com/c/f61832508891"
        },
    ),
    Tool(
        slug="on-rank-article-viewer",
        status=StatusEnum.NORMAL,
        status_description=None,
        data_update_freq="每天凌晨 1:00",
        last_update_time_table="article_earning_ranking_records",
        last_update_time_order_by="date",
        last_update_time_target_field="date",
        data_count_table="article_earning_ranking_records",
        data_source={
            "简书 - 简书钻每日发放总榜": "https://www.jianshu.com/fp/notice/now"
        },
    ),
    Tool(
        slug="URL-scheme-convertor",
        status=StatusEnum.NORMAL,
        status_description=None,
        data_update_freq="实时",
        last_update_time_table=None,
        last_update_time_order_by=None,
        last_update_time_target_field=None,
        data_count_table=None,
        data_source=None,
    ),
    Tool(
        slug="VIP-info-viewer",
        status=StatusEnum.NORMAL,
        status_description=None,
        data_update_freq="实时",
        last_update_time_table=None,
        last_update_time_order_by=None,
        last_update_time_target_field=None,
        data_count_table=None,
        data_source=None,
    ),
    Tool(
        slug="VIP-profit-compute",
        status=StatusEnum.NORMAL,
        status_description=None,
        data_update_freq="实时",
        last_update_time_table=None,
        last_update_time_order_by=None,
        last_update_time_target_field=None,
        data_count_table=None,
        data_source={
            "简书 - 简书会员大使": "https://www.jianshu.com/mobile/club/ambassador"
        },
    ),
)
