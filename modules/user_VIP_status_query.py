from datetime import datetime

from config_manager import config
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import User
from pywebio.output import put_button, put_markdown, toast, use_scope
from pywebio.pin import pin, put_input

from .utils import SetFooter, TimeDeltaFormat


def OnQueryButtonClicked():
    url = pin.url

    try:
        user = User.from_url(url)
    except (InputError, ResourceError):
        toast("输入的 URL 无效，请检查", color="error")
        return

    with use_scope("output", clear=True):
        put_markdown("---")  # 分割线

        if not user.VIP_info["vip_type"]:  # 没有 VIP
            put_markdown(f"""
            **查询结果**
            作者名：{user.name}
            VIP 等级：无 VIP
            """)
        else:  # 有 VIP
            remaining_time = user.VIP_info["expire_date"] - datetime.now()
            put_markdown(f"""
            **查询结果**
            作者名：{user.name}
            VIP 等级：{user.VIP_info["vip_type"]}
            VIP 到期时间：{user.VIP_info["expire_date"]}
            VIP 剩余时间：{TimeDeltaFormat(remaining_time)}
            """)


def UserVIPStatusQuery():
    """会员状态查询工具"""

    put_markdown("""
    # 会员状态查询工具
    查询用户的会员状态。

    数据来自简书官方接口。
    """)

    put_input("url", label="请输入用户 URL：")
    put_button("查询", onclick=OnQueryButtonClicked)

    SetFooter(config["service_pages_footer"])
