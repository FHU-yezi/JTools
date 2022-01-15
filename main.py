from pywebio import start_server
from pywebio.output import (put_button, put_info, put_link, put_markdown,
                            put_warning)
from yaml import SafeLoader
from yaml import load as yaml_load

from modules.article_downloader import ArticleDownloader
from modules.article_wordcloud_generator import ArticleWordcloudGenerator
from modules.diszeroer_helper import DiszeroerHelper
from modules.url_scheme_converter import URLSchemeConverter
from modules.user_assets_viewer import UserAssetsViewer
from modules.utils import SetFooter, GetUrl
from modules.wordage_statistics_tool import WordageStatisticsTool

__version__ = "1.0.0"


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

>>>>>>> dev
    Made with [JRT](https://github.com/FHU-yezi/JianshuResearchTools) and ♥
    OpenSource On GitHub：[JianshuMicroFeatures](https://github.com/FHU-yezi/JianshuMicroFeatures)
    Version：{__version__}
    """)

    with open("config.yaml", "r", encoding="utf-8") as f:
        config = yaml_load(f, SafeLoader)
    config.sort(key=lambda x: x["on_top"], reverse=True)  # 置顶的服务排在前面

    for service in config:
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

    SetFooter(f"Version {__version__}, Made with ♥")


start_server([
             index,
             UserAssetsViewer,
             URLSchemeConverter,
             ArticleDownloader,
             ArticleWordcloudGenerator,
             WordageStatisticsTool,
             DiszeroerHelper],
             port=8602)
