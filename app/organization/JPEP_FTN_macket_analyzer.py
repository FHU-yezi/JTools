from datetime import datetime, timedelta
from typing import List, Literal, Tuple

import pyecharts.options as opts
from pyecharts.charts import Line, Pie
from pywebio.output import put_html, put_markdown
from sspeedup.cache.timeout import timeout_cache

from utils.chart import (
    ANIMATION_OFF,
    LABEL_HIDDEN,
    LEGEND_HIDDEN,
    TOOLTIP_HIDDEN,
)
from utils.db import JPEP_FTN_macket_db

NAME = "积分兑换平台贝市分析工具"
DESC = "分析简书积分兑换平台贝市数据。"


def get_latest_data_time() -> datetime:
    return (
        JPEP_FTN_macket_db.find(
            {},
            {
                "_id": 0,
                "fetch_time": 1,
            },
        )
        .sort("fetch_time", -1)
        .limit(1)
        .next()["fetch_time"]
    )


@timeout_cache(300)
def get_data_update_time() -> str:
    return str(
        JPEP_FTN_macket_db.find(
            {},
            {
                "_id": 0,
                "fetch_time": 1,
            },
        )
        .sort("fetch_time", -1)
        .limit(1)
        .next()["fetch_time"]
    )


@timeout_cache(300)
def get_data_count() -> int:
    return JPEP_FTN_macket_db.count_documents({})


def get_side_total_count(  # noqa: N802
    type_: Literal["buy", "sell"], time: datetime
) -> int:
    """获取某一侧的市场总贝数"""
    return JPEP_FTN_macket_db.aggregate(
        [
            {
                "$match": {
                    "fetch_time": time,
                    "trade_type": type_,
                }
            },
            {
                "$group": {
                    "_id": None,
                    "sum": {
                        "$sum": "$amount.tradable",
                    },
                },
            },
        ]
    ).next()["sum"]


def get_price_capacity(
    type_: Literal["buy", "sell"], time: datetime, price: float
) -> int:
    """获取某个价格的市场容量。

    该值为这个价格的全部挂单可交易贝数和。
    """
    return JPEP_FTN_macket_db.aggregate(
        [
            {
                "$match": {
                    "fetch_time": time,
                    "trade_type": type_,
                    "price": price,
                }
            },
            {
                "$group": {
                    "_id": None,
                    "capacity": {
                        "$sum": "$amount.tradable",
                    },
                },
            },
        ]
    ).next()["capacity"]


def get_FTN_price(type_: Literal["buy", "sell"], time: datetime) -> float:  # noqa: N802
    """获取某一侧的挂单价格"""
    return JPEP_FTN_macket_db.aggregate(
        [
            {
                "$match": {
                    "fetch_time": time,
                    "trade_type": type_,
                }
            },
            {
                "$group": {
                    "_id": None,
                    "price": {
                        "$min" if type_ == "buy" else "$max": "$price",
                    },
                }
            },
        ]
    ).next()["price"]


def get_buy_sell_amount_count_pie_chart(buy_count: int, sell_count: int) -> Pie:
    return (
        Pie(
            init_opts=opts.InitOpts(
                width="880px",
                height="400px",
                animation_opts=ANIMATION_OFF,
            )
        )
        .add("", (("买贝", buy_count), ("卖贝", sell_count)))
        .set_global_opts(
            legend_opts=LEGEND_HIDDEN,
            title_opts=opts.TitleOpts(
                pos_left="30px",
                pos_top="5px",
                title="买卖贝交易单量",
            ),
            tooltip_opts=TOOLTIP_HIDDEN,
        )
        .set_series_opts(
            label_opts=opts.LabelOpts(
                formatter="{b}：{c}（{d}%）",
            )
        )
    )


def get_24h_price_data() -> Tuple[List[datetime], List[float], List[float]]:
    buy_data = JPEP_FTN_macket_db.aggregate(
        [
            {
                "$match": {
                    "fetch_time": {
                        "$gte": datetime.now() - timedelta(hours=24),
                    },
                    "trade_type": "buy",
                }
            },
            {
                "$group": {
                    "_id": "$fetch_time",
                    "price": {
                        "$min": "$price",
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
    sell_data = JPEP_FTN_macket_db.aggregate(
        [
            {
                "$match": {
                    "fetch_time": {
                        "$gte": datetime.now() - timedelta(hours=24),
                    },
                    "trade_type": "sell",
                }
            },
            {
                "$group": {
                    "_id": "$fetch_time",
                    "price": {
                        "$max": "$price",
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
    buy_price_list: List[float] = []
    sell_price_list: List[float] = []
    for buy_item, sell_item in zip(buy_data, sell_data):
        if buy_item["_id"] == sell_item["_id"]:
            x.append(buy_item["_id"])
            buy_price_list.append(buy_item["price"])
            sell_price_list.append(sell_item["price"])
        else:
            x.append(buy_item["_id"])
            buy_price_list.append(buy_item["price"])
            sell_price_list.append(0.0)
            x.append(sell_item["_id"])
            buy_price_list.append(0.0)
            sell_price_list.append(sell_item["price"])

    return x, buy_price_list, sell_price_list


def get_3d_price_data() -> Tuple[List[datetime], List[float], List[float]]:
    buy_data = JPEP_FTN_macket_db.aggregate(
        [
            {
                "$match": {
                    "fetch_time": {
                        "$gte": datetime.now() - timedelta(days=3),
                    },
                    "trade_type": "buy",
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateTrunc": {
                            "date": "$fetch_time",
                            "unit": "hour",
                        }
                    },
                    "price": {
                        "$min": "$price",
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
    sell_data = JPEP_FTN_macket_db.aggregate(
        [
            {
                "$match": {
                    "fetch_time": {
                        "$gte": datetime.now() - timedelta(days=3),
                    },
                    "trade_type": "sell",
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateTrunc": {
                            "date": "$fetch_time",
                            "unit": "hour",
                        }
                    },
                    "price": {
                        "$max": "$price",
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
    buy_price_list: List[float] = []
    sell_price_list: List[float] = []
    for buy_item, sell_item in zip(buy_data, sell_data):
        if buy_item["_id"] == sell_item["_id"]:
            x.append(buy_item["_id"])
            buy_price_list.append(buy_item["price"])
            sell_price_list.append(sell_item["price"])
        else:
            x.append(buy_item["_id"])
            buy_price_list.append(buy_item["price"])
            sell_price_list.append(0.0)
            x.append(sell_item["_id"])
            buy_price_list.append(0.0)
            sell_price_list.append(sell_item["price"])

    return x, buy_price_list, sell_price_list


def get_24h_price_line_chart() -> Line:
    x, buy_pice_list, sell_price_list = get_24h_price_data()

    # 去除时间数据中的年份和秒数部分，并将其转换成字符串
    x = [f"{item.month}.{item.day} {item.hour}:{item.minute}" for item in x]

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
            "买贝",
            y_axis=buy_pice_list,  # type: ignore
            is_smooth=True,
            itemstyle_opts=opts.ItemStyleOpts(
                opacity=0,
            ),
            label_opts=LABEL_HIDDEN,
        )
        .add_yaxis(
            "卖贝",
            y_axis=sell_price_list,  # type: ignore
            is_smooth=True,
            itemstyle_opts=opts.ItemStyleOpts(
                opacity=0,
            ),
            label_opts=LABEL_HIDDEN,
        )
        .set_series_opts(
            markline_opts=opts.MarkLineOpts(
                data=[
                    opts.MarkLineItem(name="官方标定价格", y=0.1),
                ]
            )
        )
        .set_global_opts(
            title_opts=opts.TitleOpts(
                pos_left="30px",
                pos_top="5px",
                title="24 小时贝价走势",
            ),
            yaxis_opts=opts.AxisOpts(
                min_=0.08,
                max_=0.20,
            ),
        )
    )

def get_3d_price_line_chart() -> Line:
    x, buy_pice_list, sell_price_list = get_3d_price_data()

    # 去除时间数据中的年份和秒，并将其转换成字符串
    x = [f"{item.month}.{item.day} {item.hour}:00" for item in x]

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
            "买贝",
            y_axis=buy_pice_list,  # type: ignore
            is_smooth=True,
            itemstyle_opts=opts.ItemStyleOpts(
                opacity=0,
            ),
            label_opts=LABEL_HIDDEN,
        )
        .add_yaxis(
            "卖贝",
            y_axis=sell_price_list,  # type: ignore
            is_smooth=True,
            itemstyle_opts=opts.ItemStyleOpts(
                opacity=0,
            ),
            label_opts=LABEL_HIDDEN,
        )
        .set_series_opts(
            markline_opts=opts.MarkLineOpts(
                data=[
                    opts.MarkLineItem(name="官方标定价格", y=0.1),
                ]
            )
        )
        .set_global_opts(
            title_opts=opts.TitleOpts(
                pos_left="30px",
                pos_top="5px",
                title="3 天贝价走势",
            ),
            yaxis_opts=opts.AxisOpts(
                min_=0.08,
                max_=0.20,
            ),
        )
    )

def JPEP_FTN_macket_analyzer() -> None:  # noqa: N802
    latest_data_time = get_latest_data_time()

    put_markdown(
        f"""
        - 数据范围：2023.03.19 - {get_data_update_time()}（10 分钟更新一次）
        - 当前数据量：{get_data_count()}
        """
    )

    put_markdown("## 贝池统计")

    buy_total_count = get_side_total_count("buy", latest_data_time)
    sell_total_count = get_side_total_count("sell", latest_data_time)
    buy_price = get_FTN_price("buy", latest_data_time)
    sell_price = get_FTN_price("sell", latest_data_time)
    put_markdown(
        f"""
        买贝侧贝池：{buy_total_count}
        卖贝侧贝池：{sell_total_count}
        买贝价：{buy_price}（容量：{get_price_capacity('buy', latest_data_time, buy_price)}）
        卖贝价：{sell_price}（容量：{get_price_capacity('sell', latest_data_time, sell_price)}）
        """
    )
    put_html(
        get_buy_sell_amount_count_pie_chart(
            buy_total_count, sell_total_count
        ).render_notebook()
    )

    put_html(get_24h_price_line_chart().render_notebook())
    put_html(get_3d_price_line_chart().render_notebook())
