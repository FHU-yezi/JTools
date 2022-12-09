from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set

import pyecharts.options as opts
from pywebio.output import put_html, put_markdown, put_tabs

from utils.cache import timeout_cache
from utils.chart import get_pie_chart
from utils.db import lottery_db
from widgets.table import put_table

NAME: str = "大转盘数据分析工具"
DESC: str = "分析大转盘中奖率等数据。"
REWARDS_WITH_WHITESPACE: Set[str] = {
    "收益加成卡 100",
    "收益加成卡 1 万",
    "四叶草徽章",
    "锦鲤头像框 1 年",
    "免费开 1 次连载",
    "招财猫头像框 1 年",
}
REWARDS_WITHOUT_WHITESPACE: Set[str] = set(
    (x.replace(" ", "") for x in REWARDS_WITH_WHITESPACE)
)
DESC_TO_TIMEDELTA: Dict[str, Optional[timedelta]] = {
    "1 天": timedelta(days=1),
    "7 天": timedelta(days=7),
    "30 天": timedelta(days=30),
    "全部": None,
}


@timeout_cache(3600)
def get_data_update_time() -> str:
    result: datetime = list(
        lottery_db.find(
            {},
            {
                "_id": 0,
                "time": 1,
            },
        )
        .sort("time", -1)
        .limit(1)
    )[0]["time"]
    return str(result)


@timeout_cache(3600)
def get_data_count() -> int:
    return lottery_db.count_documents({})


def get_data_start_time(td: Optional[timedelta] = None) -> datetime:
    return (
        datetime.now() - td
        if td
        else datetime(
            year=1970,
            month=1,
            day=1,
        )
    )


@timeout_cache(3600)
def get_period_award_name_times_data(td: Optional[timedelta] = None) -> Dict[str, int]:
    data = list(
        lottery_db.aggregate(
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
                        "reward_count": {
                            "$sum": 1,
                        },
                    },
                },
            ],
        )
    )
    return {item["_id"]: item["reward_count"] for item in data}


@timeout_cache(3600)
def get_period_rewarded_times_count(
    reward_name: str, td: Optional[timedelta] = None
) -> int:
    return lottery_db.count_documents(
        {
            "reward_name": reward_name,
            "time": {
                "$gte": get_data_start_time(td),
            },
        },
    )


@timeout_cache(3600)
def get_period_rewarded_users_count(
    reward_name: str, td: Optional[timedelta] = None
) -> int:
    return len(
        lottery_db.distinct(
            "user.id",
            {
                "reward_name": reward_name,
                "time": {
                    "$gte": get_data_start_time(td),
                },
            },
        )
    )


def get_award_probability(reward_type_count: Dict[str, int]) -> Dict[str, float]:
    total_count: int = sum(reward_type_count.values())
    return {
        key: round(value / total_count, 7) for key, value in reward_type_count.items()
    }


def get_award_rarity(reward_percent: Dict[str, float]) -> Dict[str, float]:
    result = {key: 1 / value for key, value in reward_percent.items()}
    scale: float = 1 / result["收益加成卡100"]  # 修正比例
    return {key: round(value * scale, 3) for key, value in result.items()}


def get_period_reward_type_chart(td: Optional[timedelta] = None):
    data = get_period_award_name_times_data(td)
    if not data:
        return "<p>暂无数据</p>"

    return (
        get_pie_chart(
            data,
            in_tab=True,
        )
        .set_global_opts(
            legend_opts=opts.LegendOpts(
                is_show=False,
            ),
        )
        .set_series_opts(
            label_opts=opts.LabelOpts(
                formatter="{b}：{c} 次",
            ),
        )
        .render_notebook()
    )


def get_general_analyze_data(td: Optional[timedelta] = None) -> List[Dict]:
    award_name_times_all: Dict[str, int] = get_period_award_name_times_data(td)
    reward_percent_all: Dict[str, float] = get_award_probability(award_name_times_all)
    award_rarity_all: Dict[str, float] = get_award_rarity(reward_percent_all)

    data: List[Dict] = []
    total_rewarded_times_count: int = 0
    total_rewarded_user_count: int = 0
    for award_name in REWARDS_WITHOUT_WHITESPACE:
        rewarded_times: int = award_name_times_all.get(award_name, 0)
        rewarded_users_count: int = get_period_rewarded_users_count(award_name, td)

        data.append(
            {
                "奖品名称": award_name,
                "中奖次数": rewarded_times,
                "中奖人数": rewarded_users_count,
                "每人平均次数": (
                    round(rewarded_times / rewarded_users_count, 3)
                    if rewarded_times != 0
                    else "-"
                ),
                "中奖率": f"{round(reward_percent_all.get(award_name, 0.0) * 100, 3)}%",
                "稀有度": award_rarity_all.get(award_name, 0.0),
            }
        )
        total_rewarded_times_count += rewarded_times
        total_rewarded_user_count += rewarded_users_count

    # 按中奖次数倒序排列
    data = sorted(data, key=lambda x: x["中奖次数"], reverse=True)

    # 总计（不参与排序，始终在底部）
    data.append(
        {
            "奖品名称": "总计",
            "中奖次数": total_rewarded_times_count,
            "中奖人数": total_rewarded_user_count,
            "每人平均次数": (
                round(total_rewarded_times_count / total_rewarded_user_count, 3)
                if total_rewarded_times_count != 0
                else "-"
            ),
            "中奖率": "-",
            "稀有度": "-",
        }
    )

    return data


def lottery_data_analyze() -> None:
    put_markdown(
        f"""
        - 数据范围：2021.12.29 - {get_data_update_time()}（每天 2:00、9:00、14:00、21:00 更新）
        - 当前数据量：{get_data_count()}
        - 仅统计“收益加成卡 100”以上的奖项：
        """
        + "    - "
        + "\n            - ".join(REWARDS_WITH_WHITESPACE)  # 拼接奖品字符串
    )

    put_markdown("## 综合统计")
    put_tabs(
        [
            {
                "title": key,
                "content": put_table(get_general_analyze_data(value)),
            }
            for key, value in DESC_TO_TIMEDELTA.items()
        ]
    )

    put_markdown("## 获奖频率分布")
    put_tabs(
        [
            {
                "title": key,
                "content": put_html(get_period_reward_type_chart(value)),
            }
            for key, value in DESC_TO_TIMEDELTA.items()
        ]
    )
