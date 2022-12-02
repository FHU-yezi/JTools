from datetime import datetime
from typing import Any, Dict, List, Tuple

from pywebio.output import put_button, put_html, put_markdown, put_table, toast
from pywebio.pin import pin, pin_on_change, pin_update, put_input, put_select

from utils.cache import timeout_cache
from utils.callback import bind_enter_key_callback
from utils.db import article_FP_rank_db
from utils.dict_helper import unfold
from utils.html import link
from utils.text_filter import has_banned_chars, input_filter
from utils.widgets import (
    green_loading,
    toast_warn_and_return,
    use_result_scope,
)

NAME: str = "上榜文章查询工具"
DESC: str = "查询用户的文章上榜历史。"
DATA_MAPPING: Dict[str, str] = {
    "date": "上榜日期",
    "ranking": "排名",
    "article.title": "文章标题",
    "reward.to_author": "获钻量",
}
SORT_KEY_MAPPING: Dict[str, Tuple[str, int]] = {
    "上榜日期": ("date", -1),
    "排名": ("ranking", 1),
    "获钻量": ("reward.to_author", -1),
}


@timeout_cache(3600)
def get_data_update_time() -> str:
    result: datetime = list(
        article_FP_rank_db.find({}, {"_id": 0, "date": 1}).sort("date", -1).limit(1)
    )[0]["date"]
    return str(result).split()[0]


@timeout_cache(3600)
def get_data_count() -> int:
    return article_FP_rank_db.count_documents({})


def get_similar_names(text: str) -> List[str]:
    if not 0 < len(text) <= 15:  # 字段为空或过长
        return []
    elif has_banned_chars(text):  # 含有不可能出现在昵称中的字符
        return []

    return (
        article_FP_rank_db.distinct(
            "author.name",
            {
                "author.name": {
                    "$regex": f"^{text}",
                },
            },
        )
    )[
        :5
    ]  # 只返回前五个结果


def has_record(name: str) -> bool:
    return article_FP_rank_db.count_documents({"author.name": name}) != 0


def get_record(name: str, sort_key: Tuple[str, int]) -> List[Dict]:
    result: List[Dict] = (
        article_FP_rank_db.find(
            {
                "author.name": name,
            },
            dict(
                {"_id": 0, "article.url": 1},
                **{key: 1 for key in DATA_MAPPING.keys()},
            ),
        )
        .sort(*sort_key)
        .limit(100)
    )
    # 只有文章链接字段不在 DATA_MAPPING 中，会命中默认值
    return [
        {DATA_MAPPING.get(k, "文章链接"): v for k, v in unfold(item).items()}
        for item in result
    ]


def on_name_input_changed(new_value: str) -> None:
    pin_update("name", datalist=get_similar_names(new_value))


def on_enter_key_pressed(_) -> None:
    on_query_button_clicked()


def on_query_button_clicked() -> None:
    name: str = input_filter(pin.name)
    sort_key: Tuple[str, int] = SORT_KEY_MAPPING[pin.sort_key]

    if not name:
        toast_warn_and_return("请输入简书用户昵称")

    if not has_record(name):
        toast_warn_and_return("该用户无上榜记录")

    with green_loading():
        data: List[Dict[str, Any]] = []
        for item in get_record(name, sort_key):
            # 去除日期字段中恒为 00:00:00 的时间部分
            item["上榜日期"] = str(item["上榜日期"]).split()[0]

            # 文章标题超过 15 字符时截断
            item["文章标题"] = (
                item["文章标题"][:15] + "..." if len(item["文章标题"]) > 15 else item["文章标题"]
            )

            # 向文章标题字段添加链接
            item["文章标题"] = put_html(link(item["文章标题"], item["文章链接"], new_window=True))
            del item["文章链接"]

            data.append(item)

    toast("数据获取成功", color="success")
    with use_result_scope():
        put_table(data, header=list(DATA_MAPPING.values()))


def on_rank_article_viewer() -> None:
    put_markdown(
        f"""
        - 数据范围：2021.09.17 - {get_data_update_time()}（每天凌晨 1:00 更新）
        - 当前数据量：{get_data_count()}
        - 昵称以上榜时为准
        - 最多展示 100 条上榜记录
        """
    )

    put_select(
        "sort_key",
        options=SORT_KEY_MAPPING.keys(),
        label="排序",
        value="上榜日期",
    )
    # 必须设置 datalist 参数，否则无法正常显示输入提示
    put_input(
        "name",
        type="text",
        label="用户昵称",
        datalist=[""],
    )
    put_button(
        "查询",
        color="success",
        onclick=on_query_button_clicked,
    )
    pin_on_change(
        "name",
        onchange=on_name_input_changed,
    )
    bind_enter_key_callback(
        "name",
        on_enter_key_pressed,
    )
