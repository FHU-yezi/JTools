from datetime import date
from typing import Literal, Optional

from psycopg import sql
from sshared.postgres import Table
from sshared.strict_struct import NonEmptyStr, PositiveFloat, PositiveInt

from utils.postgres import get_jianshu_conn


class ArticleEarningRankingRecord(Table, frozen=True):
    date: date
    ranking: PositiveInt
    slug: Optional[NonEmptyStr]
    title: Optional[NonEmptyStr]
    author_slug: Optional[NonEmptyStr]

    author_earning: PositiveFloat
    voter_earning: PositiveFloat

    @classmethod
    async def get_by_author_slug(
        cls,
        author_slug: str,
        order_by: Literal["date", "ranking"],
        order_direction: Literal["ASC", "DESC"],
        offset: int,
        limit: int,
    ) -> list["ArticleEarningRankingRecord"]:
        conn = await get_jianshu_conn()
        if order_direction == "ASC":
            cursor = await conn.execute(
                sql.SQL(
                    "SELECT date, ranking, slug, title, author_earning, voter_earning "
                    "FROM article_earning_ranking_records WHERE author_slug = %s "
                    "ORDER BY {} OFFSET %s LIMIT %s;"
                ).format(sql.Identifier(order_by)),
                (author_slug, offset, limit),
            )
        else:
            cursor = await conn.execute(
                sql.SQL(
                    "SELECT date, ranking, slug, title, author_earning, voter_earning "
                    "FROM article_earning_ranking_records WHERE author_slug = %s "
                    "ORDER BY {} DESC OFFSET %s LIMIT %s;"
                ).format(sql.Identifier(order_by)),
                (author_slug, offset, limit),
            )

        data = await cursor.fetchall()
        return [
            cls(
                date=item[0],
                ranking=item[1],
                slug=item[2],
                title=item[3],
                author_slug=author_slug,
                author_earning=item[4],
                voter_earning=item[5],
            )
            for item in data
        ]

    @classmethod
    async def get_latest_record(
        cls, author_slug: str, minimum_ranking: Optional[int] = None
    ) -> Optional["ArticleEarningRankingRecord"]:
        conn = await get_jianshu_conn()
        cursor = await conn.execute(
            "SELECT date, ranking, slug, title, author_earning, voter_earning "
            "FROM article_earning_ranking_records WHERE author_slug = %s AND "
            "ranking <= %s ORDER BY date DESC, ranking DESC LIMIT 1;",
            (author_slug, minimum_ranking if minimum_ranking else 100),
        )

        data = await cursor.fetchone()
        if not data:
            return None

        return cls(
            date=data[0],
            ranking=data[1],
            slug=data[2],
            title=data[3],
            author_slug=author_slug,
            author_earning=data[4],
            voter_earning=data[5],
        )

    @classmethod
    async def get_pervious_record(
        cls,
        base_record: "ArticleEarningRankingRecord",
        minimum_ranking: Optional[int] = None,
    ) -> Optional["ArticleEarningRankingRecord"]:
        conn = await get_jianshu_conn()
        cursor = await conn.execute(
            "SELECT date, ranking, slug, title, author_earning, voter_earning "
            "FROM article_earning_ranking_records WHERE ( date < %s OR "
            "( date = %s AND ranking < %s ) ) AND author_slug = %s AND ranking <= %s "
            "ORDER BY date DESC, ranking DESC LIMIT 1;",
            (
                base_record.date,
                base_record.date,
                base_record.ranking,
                base_record.author_slug,
                minimum_ranking if minimum_ranking else 100,
            ),
        )

        data = await cursor.fetchone()
        if not data:
            return None

        return cls(
            date=data[0],
            ranking=data[1],
            slug=data[2],
            title=data[3],
            author_slug=base_record.author_slug,
            author_earning=data[4],
            voter_earning=data[5],
        )
