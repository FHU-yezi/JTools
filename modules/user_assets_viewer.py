import pyecharts.options as opts
from config_manager import config
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import User
from pyecharts.charts import Pie
from pywebio.input import TEXT
from pywebio.output import put_button, put_html, put_markdown, toast, use_scope
from pywebio.pin import pin, put_input

from .utils import SetFooter


def OnQueryButtonClicked():
    url = pin.user_url

    try:
        user = User.from_url(url)
    except (InputError, ResourceError):
        toast("输入的 URL 无效，请检查", color="error")
        return

    toast("数据获取成功", color="success")

    with use_scope("output", clear=True):
        put_markdown(f"""
        # {user.name} 的资产信息
        简书钻：{user.FP_count}
        简书贝：{user.FTN_count}
        总资产：{user.assets_count}
        钻贝比：{round(user.FP_count / user.FTN_count, 2)}
        """)

        figure = (
            Pie()
            .add("", [("简书钻（FP）", user.FP_count), ("简书贝（FTN）", user.FTN_count)])
            .set_series_opts(label_opts=opts.LabelOpts(formatter="{b}: {d}%"))
            .set_global_opts(title_opts=opts.TitleOpts(title=f"{user.name} 的资产占比"))
        )
        put_html(figure.render_notebook())  # 获取 HTML 并展示


def UserAssetsViewer():
    """简书小工具集：用户资产查询工具"""

    put_markdown("""
    # 用户资产查询工具
    """)

    put_input("user_url", label="请输入用户主页 URL：", type=TEXT)
    put_button("查询", OnQueryButtonClicked)

    SetFooter(config["service_pages_footer"])
