from datetime import datetime, timedelta
from typing import Dict, Optional

from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import User
from pywebio.output import put_markdown, toast
from pywebio.pin import pin, put_input

from utils.callback import bind_enter_key_callback
from utils.text_filter import input_filter
from utils.time_helper import human_readable_td
from utils.widgets import (
    toast_error_and_return,
    toast_warn_and_return,
    use_result_scope,
)
from widgets.button import put_button

NAME: str = "会员状态查询工具"
DESC: str = "查询用户的会员状态与到期时间。"


def on_query_button_clicked() -> None:
    url: str = input_filter(pin.url)

    if not url:
        toast_warn_and_return("请输入简书用户 URL")

    try:
        user = User.from_url(url)
    except InputError:
        toast_error_and_return("输入的不是简书用户 URL")
    except ResourceError:
        toast_error_and_return("用户已注销或被封号，无法获取数据")

    VIP_info: Dict = user.VIP_info

    vip_type: Optional[str] = VIP_info["vip_type"]
    has_VIP: bool = True if vip_type else False
    if has_VIP:
        expire_time: datetime = VIP_info["expire_date"]
        remain_time: timedelta = expire_time - datetime.now()

    toast("数据获取成功", color="success")

    with use_result_scope():
        if has_VIP:
            put_markdown(
                f"""
                用户名：{user.name}
                链接：{url}
                VIP 等级：{vip_type}
                VIP 到期时间：{expire_time}（剩余 {human_readable_td(remain_time)}）
                """
            )
        else:
            put_markdown(
                f"""
                用户名：{user.name}
                链接：{url}
                **该用户没有开通 VIP**
                """
            )


def user_VIP_status_viewer() -> None:
    put_input(
        "url",
        type="text",
        label="用户 URL",
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