from asyncio import gather
from datetime import datetime, timedelta
from typing import Annotated, Dict, List, Literal, Optional

from litestar import Response, Router, get
from litestar.params import Parameter
from msgspec import Struct
from sspeedup.api.litestar import (
    RESPONSE_STRUCT_CONFIG,
    generate_response_spec,
    success,
)
from sspeedup.time_helper import get_start_time

from utils.db import LOTTERY_COLLECTION

REWARD_NAMES: List[str] = [
    "收益加成卡100",
    "收益加成卡1万",
    "四叶草徽章",
    "锦鲤头像框1年",
]

RANGE_TO_TIMEDELTA: Dict[str, Optional[timedelta]] = {
    "1d": timedelta(days=1),
    "7d": timedelta(days=7),
    "30d": timedelta(days=30),
    "all": None,
}

RESOLUTION_TO_TIME_UNIT: Dict[str, str] = {
    "1h": "hour",
    "1d": "day",
}


async def get_summary_wins_count(td: Optional[timedelta]) -> Dict[str, int]:
    db_result = LOTTERY_COLLECTION.aggregate(
        [
            {
                "$match": {
                    "time": {
                        "$gte": get_start_time(td),
                    },
                },
            },
            {
                "$group": {
                    "_id": "$reward_name",
                    "count": {
                        "$sum": 1,
                    },
                },
            },
        ]
    )

    result = {key: 0 for key in REWARD_NAMES}
    result.update({item["_id"]: item["count"] async for item in db_result})
    return result


async def get_summary_winners_count(td: Optional[timedelta]) -> Dict[str, int]:
    result: Dict[str, int] = {}

    for reward_name in REWARD_NAMES:
        result[reward_name] = len(
            await LOTTERY_COLLECTION.distinct(
                "user.id",
                {
                    "reward_name": reward_name,
                    "time": {
                        "$gte": get_start_time(td),
                    },
                },
            )
        )

    return result


def get_summary_average_wins_count_per_winner(
    wins_count: Dict[str, int], winners_count: Dict[str, int]
) -> Dict[str, float]:
    result: Dict[str, float] = {}

    for reward_name in wins_count:
        # 该奖项无人中奖
        if wins_count[reward_name] == 0:
            result[reward_name] = 0
            continue

        result[reward_name] = round(
            wins_count[reward_name] / winners_count[reward_name], 3
        )

    return result


def get_summary_winning_rate(wins_count: Dict[str, int]) -> Dict[str, float]:
    total_wins_count = sum(wins_count.values())
    if not total_wins_count:  # 所有奖项均无人中奖
        return {key: 0 for key in wins_count}

    return {
        key: round(value / total_wins_count, 5) for key, value in wins_count.items()
    }


def get_summary_rarity(wins_count: Dict[str, int]) -> Dict[str, float]:
    result = {
        key: (1 / value if value != 0 else 0.0)
        for key, value in get_summary_winning_rate(wins_count).items()
    }

    # 如果可能，使用收益加成卡 100 的中奖率修正其它结果
    scale: float = 1 / result.get("收益加成卡 100", 1.0)

    return {key: round(value * scale, 3) for key, value in result.items()}


async def get_rewards_wins_history(
    td: timedelta, time_unit: str
) -> Dict[datetime, int]:
    result = LOTTERY_COLLECTION.aggregate(
        [
            {
                "$match": {
                    "time": {
                        "$gt": get_start_time(td),
                    },
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateTrunc": {
                            "date": "$time",
                            "unit": time_unit,
                        },
                    },
                    "count": {
                        "$sum": 1,
                    },
                }
            },
            {
                "$sort": {
                    "_id": 1,
                },
            },
        ]
    )

    return {item["_id"]: item["count"] async for item in result}


class GetRewardsResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    rewards: List[str]


@get(
    "/rewards",
    summary="获取奖项列表",
    responses={
        200: generate_response_spec(GetRewardsResponse),
    },
)
async def get_rewards_handler() -> Response:
    return success(
        data=GetRewardsResponse(
            rewards=REWARD_NAMES,
        )
    )


class GetRecordItem(Struct, **RESPONSE_STRUCT_CONFIG):
    time: datetime
    reward_name: str


class GetRecordsResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    records: List[GetRecordItem]


@get(
    "/records",
    summary="获取中奖记录",
    responses={
        200: generate_response_spec(GetRecordsResponse),
    },
)
async def get_records_handler(
    offset: Annotated[int, Parameter(description="分页偏移", ge=0)] = 0,
    limit: Annotated[int, Parameter(description="结果数量", gt=0, lt=100)] = 20,
    target_rewards: Annotated[
        Optional[List[str]], Parameter(description="奖项筛选列表", max_items=10)
    ] = None,
) -> Response:
    result = (
        LOTTERY_COLLECTION.find(
            {
                "reward_name": {
                    "$in": target_rewards if target_rewards else REWARD_NAMES,
                }
            }
        )
        .sort("time", -1)
        .skip(offset)
        .limit(limit)
    )

    records: List[GetRecordItem] = []
    async for item in result:
        records.append(
            GetRecordItem(
                time=item["time"],
                reward_name=item["reward_name"],
            )
        )

    return success(
        data=GetRecordsResponse(
            records=records,
        )
    )


class GetSummaryRewardItem(Struct, **RESPONSE_STRUCT_CONFIG):
    reward_name: str
    wins_count: int
    winners_count: int
    average_wins_count_per_winner: float
    winning_rate: float
    rarity: float


class GetSummaryResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    rewards: List[GetSummaryRewardItem]


@get(
    "/summary",
    summary="获取抽奖摘要",
    responses={
        200: generate_response_spec(GetSummaryResponse),
    },
)
async def get_summary_handler(
    range: Annotated[  # noqa: A002
        Literal["1d", "7d", "30d", "all"], Parameter(description="时间范围")
    ],
) -> Response:
    td = RANGE_TO_TIMEDELTA[range]

    wins_count, winners_count = await gather(
        get_summary_wins_count(td),
        get_summary_winners_count(td),
    )

    average_wins_count_per_winner = get_summary_average_wins_count_per_winner(
        wins_count, winners_count
    )
    winning_rate = get_summary_winning_rate(wins_count)
    rarity = get_summary_rarity(wins_count)

    rewards: List[GetSummaryRewardItem] = []
    for reward_name in REWARD_NAMES:
        rewards.append(
            GetSummaryRewardItem(
                reward_name=reward_name,
                wins_count=wins_count[reward_name],
                winners_count=winners_count[reward_name],
                average_wins_count_per_winner=average_wins_count_per_winner[
                    reward_name
                ],
                winning_rate=winning_rate[reward_name],
                rarity=rarity[reward_name],
            )
        )

    return success(
        data=GetSummaryResponse(
            rewards=rewards,
        )
    )


class GetRewardWinsHistoryResponse(Struct, **RESPONSE_STRUCT_CONFIG):
    history: Dict[datetime, int]


@get(
    "/reward-wins-history",
    summary="获取历史中奖数",
    responses={
        200: generate_response_spec(GetRewardWinsHistoryResponse),
    },
)
async def get_reward_wins_history_handler(
    range: Annotated[Literal["1d", "7d", "30d"], Parameter(description="时间范围")],  # noqa: A002
    resolution: Annotated[Literal["1h", "1d"], Parameter(description="统计粒度")],
) -> Response:
    history = await get_rewards_wins_history(
        td=RANGE_TO_TIMEDELTA[range],  # type: ignore
        time_unit=RESOLUTION_TO_TIME_UNIT[resolution],
    )

    return success(
        data=GetRewardWinsHistoryResponse(
            history=history,
        )
    )


LOTTERY_ROUTER = Router(
    path="/lottery",
    route_handlers=[
        get_rewards_handler,
        get_records_handler,
        get_summary_handler,
        get_reward_wins_history_handler,
    ],
    tags=["抽奖"],
)
