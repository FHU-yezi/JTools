from datetime import datetime

from config_manager import Config
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import User
from JianshuResearchTools.assert_funcs import AssertUserUrl, AssertUserStatusNormal
from pywebio.output import put_button, put_markdown, toast, use_scope
from pywebio.pin import pin, put_input

from .utils import SetFooter


def TimeDeltaFormat(td_object):
    seconds = int(td_object.total_seconds())
    periods = (
        ("年", 60*60*24*365),
        ("月", 60*60*24*30),
        ("天", 60*60*24),
        ("小时", 60*60),
        ("分钟", 60),
        ("秒", 1)
    )

    strings = []
    for period_name, period_seconds in periods:
        if seconds > period_seconds:
            period_value, seconds = divmod(seconds, period_seconds)
            strings.append(f"{period_value} {period_name}")

    return " ".join(strings)


def QueryUserVIPInfo():
    url = pin["url"]
    try:
        AssertUserUrl(url)
        AssertUserStatusNormal(url)
    except (InputError, ResourceError):
        toast("输入的 URL 无效，请检查", color="error")
        return  # 发生错误，不再运行后续逻辑
    else:
        user = User(user_url=url)
        user_name = user.name
        result = user.VIP_info

    with use_scope("output", clear=True):
        put_markdown("---")  # 分割线

        if not result["vip_type"]:  # 没有 VIP
            put_markdown(f"""
            **查询结果**
            作者名：{user_name}
            VIP 等级：无 VIP
            """)
        else:
            remaining_time = result["expire_date"] - datetime.now()
            put_markdown(f"""
            **查询结果**
            作者名：{user_name}
            VIP 等级：{result["vip_type"]}
            VIP 到期时间：{result["expire_date"]}
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
    put_button("查询", onclick=QueryUserVIPInfo)

    SetFooter(Config()["service_pages_footer"])
