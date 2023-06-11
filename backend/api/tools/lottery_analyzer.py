from datetime import timedelta
from typing import Dict, List, Literal, Optional

from sanic import Blueprint, HTTPResponse, Request
from sspeedup.api import CODE, sanic_response_json

from utils.db import lottery_db
from utils.inject_data_model import inject_data_model_from_query_args
from utils.pydantic_base import BaseModel
from utils.time_helper import get_data_start_time

REWARDS: Dict[str, str] = {
    "收益加成卡100": "收益加成卡 100",
    "收益加成卡1万": "收益加成卡 1 万",
    "四叶草徽章": "四叶草徽章",
    "锦鲤头像框1年": "锦鲤头像框 1 年",
    "免费开1次连载": "免费开 1 次连载",
    "招财猫头像框1年": "招财猫头像框 1 年",
}

TEXT_TO_TIMEDELTA: Dict[str, Optional[timedelta]] = {
    "1d": timedelta(days=1),
    "7d": timedelta(days=7),
    "30d": timedelta(days=30),
    "all": None,
}

lottery_analyzer_blueprint = Blueprint(
    "lottery_analyzer", url_prefix="/lottery_analyzer"
)


def get_all_rewards_wins_count(td: Optional[timedelta]) -> Dict[str, int]:
    db_result = lottery_db.aggregate(
        [
            {
                "$match": {
                    "time": {
                        "$gte": get_data_start_time(td),
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

    result = {key: 0 for key in REWARDS.values()}
    result.update({REWARDS[item["_id"]]: item["count"] for item in db_result})
    return result


def get_all_rewards_winners_count(td: Optional[timedelta]) -> Dict[str, int]:
    result: Dict[str, int] = {}

    for reward_name_without_whitespace, reward_name_with_whitespace in REWARDS.items():
        db_result = len(
            lottery_db.distinct(
                "user.id",
                {
                    "reward_name": reward_name_without_whitespace,
                    "time": {
                        "$gte": get_data_start_time(td),
                    },
                },
            )
        )
        result[reward_name_with_whitespace] = db_result

    return result


def get_average_wins_count_per_winner(
    wins_count: Dict[str, int], winners_count: Dict[str, int]
) -> Dict[str, float]:
    result: Dict[str, float] = {}
    for reward_name, item_wins_count in wins_count.items():
        # 如果该奖项无人中奖，将平均每人中奖次数设为 0
        if item_wins_count == 0:
            result[reward_name] = 0.0
            continue

        result[reward_name] = round(item_wins_count / winners_count[reward_name], 3)

    return result


def get_winning_rate(wins_count: Dict[str, int]) -> Dict[str, float]:
    total_wins_count = sum(wins_count.values())
    return {
        key: round(value / total_wins_count, 5) for key, value in wins_count.items()
    }


def get_reward_rarity(winning_rate: Dict[str, float]) -> Dict[str, float]:
    result = {
        key: (1 / value if value != 0 else 0.0) for key, value in winning_rate.items()
    }

    # 如果可能，使用收益加成卡 100 的中奖率修正其它结果
    scale: float = 1 / result.get("收益加成卡 100", 1.0)

    return {key: round(value * scale, 3) for key, value in result.items()}


def get_period_wins_count(td: Optional[timedelta]) -> Dict[str, int]:
    if not td:
        raise ValueError("不允许获取全部时间的中奖次数数据")

    unit = "hour" if td <= timedelta(days=1) else "day"

    db_result = lottery_db.aggregate(
        [
            {
                "$match": {
                    "time": {
                        "$gt": get_data_start_time(td),
                    },
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateTrunc": {
                            "date": "$time",
                            "unit": unit,
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
    if unit == "hour":
        return {
            item["_id"].strftime(r"%m-%d %I:%M"): item["count"] for item in db_result
        }

    return {item["_id"].strftime(r"%m-%d"): item["count"] for item in db_result}


class PerPrizeDataRequest(BaseModel):
    time_range: Literal["1d", "7d", "30d", "all"]


class PerPrizeDataItem(BaseModel):
    reward_name: str
    wins_count: int
    winners_count: int
    average_wins_count_per_winner: float
    winning_rate: float
    rarity: float


class PerPrizeDataResponse(BaseModel):
    rewards: List[PerPrizeDataItem]


@lottery_analyzer_blueprint.get("/per_prize_data")
@inject_data_model_from_query_args(PerPrizeDataRequest)
def per_prize_data_handler(request: Request, data: PerPrizeDataRequest) -> HTTPResponse:
    del request

    wins_count = get_all_rewards_wins_count(TEXT_TO_TIMEDELTA[data.time_range])
    winners_count = get_all_rewards_winners_count(TEXT_TO_TIMEDELTA[data.time_range])
    average_wins_count_per_winner = get_average_wins_count_per_winner(
        wins_count, winners_count
    )
    winning_rate = get_winning_rate(wins_count)
    rarity = get_reward_rarity(winning_rate)

    rewards: List[PerPrizeDataItem] = []
    for reward_name in REWARDS.values():
        rewards.append(
            PerPrizeDataItem(
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

    return sanic_response_json(
        code=CODE.SUCCESS, data=PerPrizeDataResponse(rewards=rewards).dict()
    )


class RewardWinsCountDataRequest(BaseModel):
    time_range: Literal["1d", "7d", "30d", "all"]


class RewardWinsCountDataResponse(BaseModel):
    wins_count_data: Dict[str, int]


@lottery_analyzer_blueprint.get("/reward_wins_count_data")
@inject_data_model_from_query_args(RewardWinsCountDataRequest)
def reward_wins_count_data_handler(
    request: Request, data: RewardWinsCountDataRequest
) -> HTTPResponse:
    del request

    wins_count_data = get_all_rewards_wins_count(TEXT_TO_TIMEDELTA[data.time_range])

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=RewardWinsCountDataResponse(wins_count_data=wins_count_data).dict(),
    )


class RewardWinsDataRequest(BaseModel):
    time_range: Literal["1d", "7d", "30d"]


class RewardWinsDataResponse(BaseModel):
    trend_data: Dict[str, int]


@lottery_analyzer_blueprint.get("/reward_wins_trend_data")
@inject_data_model_from_query_args(RewardWinsDataRequest)
def reward_wins_trend_data_handler(
    request: Request, data: RewardWinsDataRequest
) -> HTTPResponse:
    del request

    trend_data = get_period_wins_count(TEXT_TO_TIMEDELTA[data.time_range])

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=RewardWinsDataResponse(trend_data=trend_data).dict(),
    )
