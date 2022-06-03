from JianshuResearchTools.objects import set_cache_status
from pywebio import start_server
from pywebio.output import (popup, put_button, put_info, put_link,
                            put_markdown, put_warning)

from config_manager import config
from modules.article_downloader import ArticleDownloader
from modules.article_time_query import ArticleTimeQuery
from modules.article_wordcloud_generator import ArticleWordcloudGenerator
from modules.diszeroer_helper import DiszeroerHelper
from modules.url_scheme_converter import URLSchemeConverter
from modules.user_assets_viewer import UserAssetsViewer
from modules.user_VIP_status_query import UserVIPStatusQuery
from modules.utils import GetUrl, SetFooter
from modules.wordage_statistics_tool import WordageStatisticsTool

# 为保证数据实时性并节省内存消耗，禁用全局缓存
set_cache_status(False)

STATUS_TO_TEXT = {-1: "暂停服务", 0: "正常运行", 1: "降级运行"}
STATUS_TO_BUTTON_COLOR_TEXT = {-1: "danger", 0: "success", 1: "warning"}
STATUS_TO_COLOR_HEX = {-1: "#FF2D10", 0: "#008700", 1: "#FF8C00"}


def index():
    """简书小工具集

    为简友提供高效便捷的科技工具
    """
    put_markdown(f"""
    # 简书小工具集
    为简友提供高效便捷的科技工具。

    Made with [JRT](https://github.com/FHU-yezi/JianshuResearchTools) and ♥
    OpenSource On GitHub：[JianshuMicroFeatures](https://github.com/FHU-yezi/JianshuMicroFeatures)
    Version：{config["version"]}
    """)

    if config["global_notification"]:
        popup("公告", config["global_notification"])

    services = sorted(config["services"], key=lambda x: x["on_top"], reverse=True)

    for service in services:
        put_markdown(f"## {service['name']}")

        if service["on_top"]:
            put_button("置顶", color="success", small=True, onclick=lambda: None)  # 显示置顶标签，点击无效果

        if service["status"] == 1:  # 降级运行状态
            put_warning("该服务处于降级运行状态，其性能可能受到影响，我们将尽力恢复其正常运行，感谢您的谅解")

        if service["notification"]:
            put_info(service["notification"])

        put_markdown(f"""
        {service["description"]}

        服务状态：<font color={STATUS_TO_COLOR_HEX[service["status"]]}>**{STATUS_TO_TEXT[service["status"]]}**</font>
        """)
        if service["status"] >= 0:  # 只有服务正常运行时才允许跳转
            put_link("点击进入", url=f"{GetUrl()}?app={service['service_func_name']}")

    SetFooter(config["mainpage_footer"])


SERVICES_LIST = [
    index,
    ArticleDownloader,
    ArticleTimeQuery,
    ArticleWordcloudGenerator,
    DiszeroerHelper,
    URLSchemeConverter,
    UserAssetsViewer,
    UserVIPStatusQuery,
    WordageStatisticsTool
]

start_server(SERVICES_LIST, port=config["port"])
