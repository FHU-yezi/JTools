from typing import Dict, List, Set

from JianshuResearchTools.assert_funcs import AssertUserUrl
from JianshuResearchTools.exceptions import InputError
from sanic import Blueprint, HTTPResponse, Request
from sspeedup.api import CODE, sanic_response_json
from sspeedup.data_validation import BaseModel, sanic_inject_pydantic_model

from utils.db import lottery_db

REWARDS: Set[str] = {
    "收益加成卡 100",
    "收益加成卡 1 万",
    "四叶草徽章",
    "锦鲤头像框 1 年",
}

lottery_reward_record_viewer_blueprint = Blueprint(
    "lottery_reward_record_viewer", url_prefix="/lottery_reward_record_viewer"
)


class RewardsResponse(BaseModel):
    rewards: List[str]


@lottery_reward_record_viewer_blueprint.get("/rewards")
async def rewards_handler(request: Request) -> HTTPResponse:
    del request

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=RewardsResponse(
            rewards=list(REWARDS),
        ).model_dump(),
    )


class LotteryRecordsRequest(BaseModel):
    user_url: str
    target_rewards: List[str]
    offset: int


class LotteryItem(BaseModel):
    time: int
    reward_name: str


class LotteryRecordsResponse(BaseModel):
    records: List[LotteryItem]
    total: int


@lottery_reward_record_viewer_blueprint.post("/lottery_records")
@sanic_inject_pydantic_model(LotteryRecordsRequest)
def lottery_records_handler(
    request: Request, data: LotteryRecordsRequest
) -> HTTPResponse:
    del request

    try:
        AssertUserUrl(data.user_url)
    except InputError:
        return sanic_response_json(code=CODE.BAD_ARGUMENTS, message="输入的简书用户个人主页链接无效")

    filter_dict = {
        "user.url": data.user_url,
        "reward_name": {
            "$in": data.target_rewards,
        },
    }
    result: List[Dict] = (
        lottery_db.find(filter_dict).sort("time", -1).skip(data.offset).limit(100)
    )  # type: ignore
    total = lottery_db.count_documents(filter_dict)

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=LotteryRecordsResponse(
            records=[
                LotteryItem(
                    time=int(x["time"].timestamp()), reward_name=x["reward_name"]
                )
                for x in result
            ],
            total=total,
        ).model_dump(),
    )
