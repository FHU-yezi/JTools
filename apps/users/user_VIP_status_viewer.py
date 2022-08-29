from JianshuResearchTools.exceptions import InputError, ResourceError
from datetime import datetime, timedelta
from JianshuResearchTools.objects import User
from pywebio.output import put_markdown, toast, use_scope, put_button
from pywebio.pin import pin, put_input
from typing import Dict, Optional
from utils.human_radable_td import human_readable_td

DESCRIPTION: str = """会员状态查询工具"""


def on_query_button_clicked() -> None:
    url: str = pin.url

    try:
        user = User.from_url(url)
    except InputError:
        toast("输入的不是简书用户 URL，请检查", color="error")
        return
    except ResourceError:
        toast("用户已注销或被封号，无法获取数据")
        return

    VIP_info: Dict = user.VIP_info

    vip_type: Optional[str] = VIP_info["vip_type"]
    has_VIP: bool = True if vip_type else False
    if has_VIP:
        expire_time: datetime = VIP_info["expire_date"]
        remain_time: timedelta = expire_time - datetime.now()

    toast("数据获取成功", color="success")

    with use_scope("result", clear=True):
        if has_VIP:
            put_markdown(f"""
            用户名：{user.name}
            链接：{url}
            VIP 等级：{vip_type}
            VIP 到期时间：{expire_time}（剩余 {human_readable_td(remain_time, accurate=False)}）
            """)
        else:
            put_markdown(f"""
            用户名：{user.name}
            链接：{url}
            **该用户没有开通 VIP**
            """)


def user_VIP_status_viewer() -> None:
    put_markdown("""
    # 会员状态查询工具

    查询简书用户的会员状态与到期时间。
    """)

    put_input("url", type="text", label="用户 URL")
    put_button("查询", color="success", onclick=on_query_button_clicked)
