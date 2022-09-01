from datetime import datetime
from typing import Any, Dict, List

from pywebio.output import (put_button, put_link, put_loading, put_markdown,
                            put_scrollable, put_table, toast, use_scope)
from pywebio.pin import pin, put_input
from utils.db_manager import article_FP_rank_db

NAME: str = "上榜文章查询工具"
DESC: str = "查询用户的文章上榜历史。"
DATA_HEADER_MAPPING: List[str] = ["上榜日期", "排名", "文章", "获钻量"]


def get_data_update_time() -> str:
    result: datetime = list(
        article_FP_rank_db
        .find({}, {"_id": 0, "date": 1})
        .sort("date", -1)
        .limit(1)
    )[0]["date"]
    return str(result).split()[0]


def get_data_count() -> int:
    return article_FP_rank_db.count_documents({})


def has_record(name: str) -> bool:
    return article_FP_rank_db.count_documents({"author.name": name}) != 0


def get_record(name: str) -> List[Dict]:
    return (
        article_FP_rank_db
        .find({"author.name": name})
        .sort("date", -1)
        .limit(100)
    )


def on_query_button_clicked() -> None:
    name: str = pin.name

    if not name:
        toast("请输入简书用户昵称", color="warn")
        return

    if not has_record(name):
        toast("该用户无上榜记录", color="warn")
        return

    with put_loading(color="success"):
        data: List[Dict[str, Any]] = []
        for item in get_record(name):
            data.append({
                "上榜日期": str(item["date"]).split()[0],
                "排名": item["ranking"],
                "文章": put_link(item["article"]["title"], item["article"]["url"], new_window=True),
                "获钻量": item["reward"]["to_author"]
            })

    toast("数据获取成功", color="success")
    with use_scope("result", clear=True):
        put_scrollable(
            put_table(data, header=DATA_HEADER_MAPPING)
        )


def on_rank_article_viewer() -> None:
    put_markdown(f"""
    - 数据范围：2021.09.17 - {get_data_update_time()}（每天凌晨 1:00 更新）
    - 当前数据量：{get_data_count()}
    - 昵称以上榜时为准
    - 最多展示 100 条上榜记录
    """)

    put_input("name", type="text", label="用户昵称")
    put_button("查询", color="success", onclick=on_query_button_clicked)
