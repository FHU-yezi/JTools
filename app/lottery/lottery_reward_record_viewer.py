from typing import Any, Dict, List, Set

from JianshuResearchTools.assert_funcs import AssertUserUrl
from JianshuResearchTools.exceptions import InputError
from pywebio.output import put_markdown, toast
from pywebio.pin import pin, put_checkbox, put_input

from utils.cache import timeout_cache
from utils.callback import bind_enter_key_callback
from utils.db import lottery_db
from utils.text_filter import input_filter
from utils.widgets import (
    green_loading,
    toast_error_and_return,
    toast_warn_and_return,
    use_result_scope,
)
from widgets.button import put_button
from widgets.table import put_table

NAME: str = "中奖记录查询工具"
DESC: str = "查询简书大转盘中奖记录。"
DATA_MAPPING: Dict[str, str] = {
    "time": "中奖时间",
    "reward_name": "奖项",
}
REWARDS_WITH_WHITESPACE: Set[str] = {
    "收益加成卡 100",
    "收益加成卡 1 万",
    "四叶草徽章",
    "锦鲤头像框 1 年",
    "免费开 1 次连载",
    "招财猫头像框 1 年",
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


def has_record(url: str) -> bool:
    return lottery_db.count_documents({"user.url": url}) != 0


def get_record(url: str) -> List[Dict]:
    result: List[Dict] = (
        lottery_db.find(
            {
                "user.url": url,
            },
            dict(
                {"_id": 0},
                **{key: 1 for key in DATA_MAPPING.keys()},
            ),  # 合并字典
        )
        .sort("time", -1)
        .limit(100)
    )
    return [{DATA_MAPPING[k]: v for k, v in item.items()} for item in result]


def on_query_button_clicked() -> None:
    url: str = input_filter(pin.url)
    # 为保证用户体验，奖项列表中的内容均在汉字与数字间加入了空格
    # 但数据库中的奖项字段没有做这一处理，因此在此处去掉空格，确保筛选正常进行
    reward_filter: List[str] = [x.replace(" ", "") for x in pin.reward_filter]

    if not url:
        toast_warn_and_return("请输入简书用户 URL")

    if not reward_filter:  # 没有勾选任何奖项一定查询不到结果
        toast_warn_and_return("请至少勾选一个奖项")

    try:
        AssertUserUrl(url)
    except InputError:
        toast_error_and_return("输入的不是简书用户 URL，请检查")

    if not has_record(url):
        toast_warn_and_return("该用户无中奖记录")

    with green_loading():
        data: List[Dict[str, Any]] = [
            x for x in get_record(url) if x["奖项"] in reward_filter
        ]

    if not data:  # 该筛选条件下无结果
        toast_warn_and_return("该筛选条件下无中奖记录")

    toast("数据获取成功", color="success")
    with use_result_scope():
        put_table(data)


def lottery_reward_record_viewer() -> None:
    put_markdown(
        f"""
        - 数据范围：2021.12.29 - {get_data_update_time()}（每天 2:00、9:00、14:00、21:00 更新）
        - 当前数据量：{get_data_count()}
        - 最多展示 100 条中奖记录
        - 仅支持查询“收益加成卡 100”以上的奖项：
        """
        + "    - "
        + "\n            - ".join(REWARDS_WITH_WHITESPACE)  # 拼接奖品字符串
    )

    put_input(
        "url",
        type="text",
        label="用户 URL",
    )
    put_checkbox(
        "reward_filter",
        label="奖项筛选",
        options=list(REWARDS_WITH_WHITESPACE),
        value=list(REWARDS_WITH_WHITESPACE),
    )
    put_button(
        "查询",
        color="success",
        onclick=on_query_button_clicked,
        block=True,
    )
    bind_enter_key_callback(
        "url",
        on_press=lambda _: on_query_button_clicked(),
    )
