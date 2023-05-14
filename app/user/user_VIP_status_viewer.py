from datetime import datetime, timedelta
from typing import Dict, Optional

from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import User
from pywebio.output import put_markdown, toast
from pywebio.pin import pin, put_input
from sspeedup.pywebio.callbacks import on_enter_pressed
from sspeedup.pywebio.scope import use_clear_scope
from sspeedup.pywebio.toast import toast_error_and_return, toast_warn_and_return
from sspeedup.time_helper import human_readable_td

from utils.text_filter import input_filter
from widgets.button import put_button

NAME = "会员状态查询工具"
DESC = "查询用户的会员状态与到期时间。"


def on_query_button_clicked() -> None:
    url: str = input_filter(pin.url)  # type: ignore

    if not url:
        toast_warn_and_return("请输入简书用户 URL")

    try:
        user = User.from_url(url)
    except InputError:
        toast_error_and_return("输入的不是简书用户 URL")
    except ResourceError:
        toast_error_and_return("用户已注销或被封号，无法获取数据")

    vip_info: Dict = user.VIP_info

    vip_type: Optional[str] = vip_info["vip_type"]
    has_vip: bool = bool(vip_type)
    if has_vip:
        expire_time: datetime = vip_info["expire_date"]
        remain_time: timedelta = expire_time - datetime.now()

    toast("数据获取成功", color="success")

    with use_clear_scope("result"):
        if has_vip:
            assert expire_time and remain_time  # type: ignore  # noqa
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


def user_VIP_status_viewer() -> None:  # noqa
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
    on_enter_pressed(
        "url",
        func=on_query_button_clicked,
    )
