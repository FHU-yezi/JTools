import pyecharts.options as opts
from config_manager import Config
from JianshuResearchTools.assert_funcs import (AssertUserStatusNormal,
                                               AssertUserUrl)
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import User
from pyecharts.charts import Pie
from pywebio.input import TEXT
from pywebio.output import (put_button, put_html, put_markdown, put_warning,
                            toast, use_scope)
from pywebio.pin import pin, put_input

from .utils import SetFooter


def OnQueryButtonClicked():
    url = pin.url

    try:
        AssertUserUrl(url)
        AssertUserStatusNormal(url)
    except (InputError, ResourceError):
        toast("输入的 URL 无效，请检查", color="error")
        return  # 发生错误，不再运行后续逻辑

    user = User(user_url=url)
    user_name = user.name
    FP = user.FP_count
    assets = user.assets_count
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

        figure = (
            Pie()
            .add("", [("简书钻（FP）", FP), ("简书贝（FTN）", FTN)])
            .set_series_opts(label_opts=opts.LabelOpts(formatter="{b}: {d}%"))
            .set_global_opts(title_opts=opts.TitleOpts(title=f"{user_name} 的资产占比"))
        )
        put_html(figure.render_notebook())  # 获取 HTML 并展示


def UserAssetsViewer():
    """简书小工具集：用户资产查询工具"""

    put_markdown("""
    # 用户资产查询工具
    """)

    put_input("user_url", label="请输入用户主页 URL：", type=TEXT)
    put_button("查询", OnQueryButtonClicked)

    SetFooter(Config()["service_pages_footer"])
