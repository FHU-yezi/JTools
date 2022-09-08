from datetime import datetime
from typing import Any, Dict, List

from pywebio.output import (put_button, put_loading, put_markdown,
                            put_scrollable, put_table, toast, use_scope)
from pywebio.pin import pin, put_input
from utils.db_manager import lottery_db
from JianshuResearchTools.assert_funcs import AssertUserUrl
from JianshuResearchTools.exceptions import InputError

NAME: str = "中奖记录查询工具"
DESC: str = "查询简书大转盘中奖记录。"
DATA_MAPPING: Dict[str, str] = {
    "time": "中奖时间",
    "reward_name": "奖项"
}


def get_data_update_time() -> str:
    result: datetime = list(
        lottery_db
        .find({}, dict({"_id": 0, "time": 1}))
        .sort("time", -1)
        .limit(1)
    )[0]["time"]
    return str(result)


def get_data_count() -> int:
    return lottery_db.count_documents({})


def has_record(url: str) -> bool:
    return lottery_db.count_documents({"user.url": url}) != 0


def get_record(url: str) -> List[Dict]:
    result: List[Dict] = (
        lottery_db
        .find(
            {"user.url": url},
            dict({"_id": 0}, **{key: 1 for key in DATA_MAPPING.keys()}),  # 合并字典
        )
        .sort("time", -1)
        .limit(100)
    )
    return [{DATA_MAPPING[k]: v for k, v in item.items()} for item in result]


def on_query_button_clicked() -> None:
    url: str = pin.url

    if not url:
        toast("请输入简书用户 URL", color="warn")
        return

    try:
        AssertUserUrl(url)
    except InputError:
        toast("输入的不是简书用户 URL，请检查", color="error")
        return

    if not has_record(url):
        toast("该用户无中奖记录", color="warn")
        return

    with put_loading(color="success"):
        data: List[Dict[str, Any]] = get_record(url)

    toast("数据获取成功", color="success")
    with use_scope("result", clear=True):
        put_scrollable(
            put_table(data, header=list(DATA_MAPPING.values()))
        )


def lottery_reward_record_viewer() -> None:
    put_markdown(f"""
    - 数据范围：2021.12.29 - {get_data_update_time()}（每天 2:00、9:00、14:00、21:00 更新）
    - 当前数据量：{get_data_count()}
    - 最多展示 100 条中奖记录
    - 仅支持查询“收益加成卡 100”以上的奖项：
        - 收益加成卡 100
        - 收益加成卡 1 万
        - 四叶草徽章
        - 锦鲤头像框 1 年
        - 免费开 1 次连载
        - 招财猫头像框 1 年
    """)

    put_input("url", type="text", label="用户 URL")
    put_button("查询", color="success", onclick=on_query_button_clicked)
