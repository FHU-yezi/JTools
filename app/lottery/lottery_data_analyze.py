from datetime import datetime, timedelta
from typing import Dict, List, Literal, Optional, Set, Tuple

import pyecharts.options as opts
from pyecharts.charts import Line, Pie
from pywebio.output import put_html, put_markdown, put_tabs

from utils.cache import timeout_cache
from utils.chart import (
    ANIMATION_OFF,
    JIANSHU_COLOR,
    LEGEND_HIIDEN,
    TOOLBOX_ONLY_SAVE_PNG_WHITE_2X,
)
from utils.db import lottery_db
from utils.page import apply_better_tabs
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
REWARDS_WITHOUT_WHITESPACE: Set[str] = {
    x.replace(" ", "") for x in REWARDS_WITH_WHITESPACE
}
DESC_TO_TIMEDELTA: Dict[str, Optional[timedelta]] = {
    "1 天": timedelta(days=1),
    "7 天": timedelta(days=7),
    "30 天": timedelta(days=30),
    "全部": None,
}
DESC_TO_TIMEDELTA_WITHOUT_ALL: Dict[str, timedelta] = {
    key: value for key, value in DESC_TO_TIMEDELTA.items() if value
}


@timeout_cache(3600)
def get_data_update_time() -> str:
    return str(
        (
            lottery_db.find(
                {},
                {
                    "_id": 0,
                    "time": 1,
                },
            )
            .sort("time", -1)
            .limit(1)
        ).next()["time"]
    )


@timeout_cache(3600)
def get_data_count() -> int:
    return lottery_db.count_documents({})


def get_data_start_time(td: Optional[timedelta] = None) -> datetime:
    """根据当前时间获取数据起始时间，当参数 td 为 None 时返回 1970-1-1，代表全部数据

    Args:
        td (Optional[timedelta], optional): 与现在的时间差. Defaults to None.

    Returns:
        datetime: 数据起始时间
    """
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
    """获取某一时间段内每个奖项的中奖次数

    Args:
        td (Optional[timedelta], optional): 时间段. Defaults to None.

    Returns:
        Dict[str, int]: 键为奖品名称，值为中奖次数
    """
    data = lottery_db.aggregate(
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
    return {item["_id"]: item["reward_count"] for item in data}


@timeout_cache(3600)
def get_period_all_award_times_data(
    unit: Literal["hour", "day"],
    td: Optional[timedelta] = None,
) -> Tuple[List[datetime], List[int]]:
    """获取某一时间段内所有奖项的中奖次数和

    Args:
        unit (Literal["hour", "day"]): 聚合单位
        td (Optional[timedelta], optional): 时间段. Defaults to None.

    Returns:
        Tuple[List[datetime], List[int]]: 时间列表和中奖次数列表，用于绘图
    """
    data = lottery_db.aggregate(
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

    x: List[datetime] = []
    y: List[int] = []
    for item in data:
        x.append(item["_id"])
        y.append(item["count"])

    return x, y


@timeout_cache(3600)
def get_period_rewarded_times_count(
    reward_name: str, td: Optional[timedelta] = None
) -> int:
    """获取某一时段内某奖项获奖的次数和

    Args:
        reward_name (str): 奖项名称
        td (Optional[timedelta], optional): 时间段，为 None 时表示全部数据. Defaults to None.
    """
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
    """获取某一时间段内获得某一奖项的用户数量

    Args:
        reward_name (str): 奖品名称
        td (Optional[timedelta], optional): 时间段. Defaults to None.

    Returns:
        int: 获奖用户数
    """
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
    """获取每种奖品的中奖率

    Args:
        reward_type_count (Dict[str, int]): 键为奖品名称，值为中奖次数

    Returns:
        Dict[str, float]: 键为奖品名称，值为中奖率
    """
    total_count: int = sum(reward_type_count.values())
    return {
        key: round(value / total_count, 7) for key, value in reward_type_count.items()
    }


def get_award_rarity(reward_percent: Dict[str, float]) -> Dict[str, float]:
    """获取奖品稀有度

    Args:
        reward_percent (Dict[str, float]): 键为奖品名称，值为中奖率

    Returns:
        Dict[str, float]: 键为奖品名称，值为稀有度
    """
    result = {key: 1 / value for key, value in reward_percent.items()}

    # 如果可能，使用收益加成卡 100 的中奖率修正其它结果
    scale: float = 1 / result["收益加成卡100"] if result.get("收益加成卡100") else 1.0

    return {key: round(value * scale, 3) for key, value in result.items()}


def get_period_reward_type_pie_chart(td: Optional[timedelta] = None) -> Pie:
    """获取某一时段各奖项的中奖率饼状图

    Args:
        td (Optional[timedelta], optional): 时间段. Defaults to None.
    """
    data = get_period_award_name_times_data(td)
    if not data:
        return "<p>暂无数据</p>"  # type: ignore TODO

    return (
        Pie(
            init_opts=opts.InitOpts(
                width="880px",
                height="400px",
                animation_opts=ANIMATION_OFF,
            )
        )
        .add("", tuple(data.items()))
        .set_global_opts(
            legend_opts=LEGEND_HIIDEN,
            title_opts=opts.TitleOpts(
                pos_left="30px",
                pos_top="5px",
                title="中奖次数分布图",
            ),
            toolbox_opts=TOOLBOX_ONLY_SAVE_PNG_WHITE_2X,
        )
        .set_series_opts(
            label_opts=opts.LabelOpts(formatter="{b}：{c} 次"),
        )
    )


def get_period_award_times_chart(td: timedelta) -> Line:
    """获取某一时间段内的中奖次数趋势图

    Args:
        td (timedelta): 时间段
    """
    unit = "hour" if td <= timedelta(days=1) else "day"
    x, y = get_period_all_award_times_data(unit, td)
    if not x:
        return "<p>暂无数据</p>"  # type: ignore TODO

    x = [str(item) for item in x]

    if unit == "hour":
        x = ["-".join(item.split("-")[1:]) for item in x]  # 去除年份部分
    elif unit == "day":
        x = [item.split()[0] for item in x]  # 去除恒为 0 的时间部分
    return (
        Line(
            init_opts=opts.InitOpts(
                width="880px",
                height="400px",
                animation_opts=ANIMATION_OFF,
            )
        )
        .add_xaxis(
            xaxis_data=x,
        )
        .add_yaxis(
            "",
            y_axis=y,  # type: ignore
            is_smooth=True,
            linestyle_opts=opts.LineStyleOpts(
                color=JIANSHU_COLOR,
            ),
            itemstyle_opts=opts.ItemStyleOpts(
                color=JIANSHU_COLOR,
            ),
            label_opts=opts.LabelOpts(
                color=JIANSHU_COLOR,
            ),
        )
        .set_global_opts(
            legend_opts=LEGEND_HIIDEN,
            title_opts=opts.TitleOpts(
                pos_left="30px",
                pos_top="5px",
                title="中奖次数趋势图",
            ),
            toolbox_opts=TOOLBOX_ONLY_SAVE_PNG_WHITE_2X,
        )
    )


def get_general_analyze_data(td: Optional[timedelta] = None) -> List[Dict]:
    """获取某一时间段内的总体分析数据

    Args:
        td (Optional[timedelta], optional): 时间段. Defaults to None.
    """
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
                "content": put_html(
                    get_period_reward_type_pie_chart(value).render_notebook()
                ),
            }
            for key, value in DESC_TO_TIMEDELTA.items()
        ]
    )

    put_markdown("## 抽奖次数趋势")
    put_tabs(
        [
            {
                "title": key,
                "content": put_html(
                    get_period_award_times_chart(value).render_notebook()
                ),
            }
            for key, value in DESC_TO_TIMEDELTA_WITHOUT_ALL.items()
        ]
    )

    apply_better_tabs()
