import plotly.graph_objs as go
from JianshuResearchTools.assert_funcs import (AssertUserStatusNormal,
                                               AssertUserUrl)
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.user import (GetUserAssetsCount, GetUserFPCount,
                                       GetUserName)
from pywebio.input import TEXT
from pywebio.output import (put_button, put_html, put_markdown, put_warning,
                            toast, use_scope)
from pywebio.pin import pin, put_input

from .utils import LinkInHTML, SetFooter


def ShowUserAssetsInfo():
    try:
        AssertUserUrl(pin["user_url"])
        AssertUserStatusNormal(pin["user_url"])
    except (InputError, ResourceError):
        toast("用户主页 URL 无效，请检查", color="error")
        return  # 发生错误，不再运行后续逻辑

    user_name = GetUserName(pin["user_url"])
    FP = GetUserFPCount(pin["user_url"])
    assets = GetUserAssetsCount(pin["user_url"])
    FTN = round(assets - FP, 3)

    toast("数据获取成功", color="success")

    with use_scope("output", clear=True):
        if FTN < 0 and assets >= 10000:
            put_warning("该用户简书贝占比过少，简书贝信息可能存在错误")

        put_markdown(f"""
        # {user_name} 的资产信息
        简书钻：{FP}
        简书贝：{FTN}
        总资产：{assets}
        钻贝比：{round(FP / FTN, 2)}
        """)

        fig = go.Figure(data=[go.Pie(labels=["简书钻（FP）", "简书贝（FTN）"],
                                     values=[FP, FTN], title="用户资产占比")])
        put_html(fig.to_html(include_plotlyjs="require", full_html=False))  # 获取 HTML 并展示


def UserAssetsViewer():
    """简书小工具集：用户资产查询工具"""

    put_markdown("""
    # 用户资产查询工具
    """)

    put_input("user_url", label="用户主页 URL", type=TEXT)
    put_button("查询", ShowUserAssetsInfo)

    SetFooter(f"Powered By \
              {LinkInHTML('JRT', 'https://github.com/FHU-yezi/JianshuResearchTools/')} \
              and {LinkInHTML('PyWebIO', 'https://github.com/pywebio/PyWebIO')}")
