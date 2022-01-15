try:
    import ujson as json
except ImportError:
    import json

from pywebio import start_server
from pywebio.output import (put_button, put_info, put_link, put_markdown,
                            put_warning)

from modules.article_downloader import ArticleDownloader
from modules.article_wordcloud_generator import ArticleWordcloudGenerator
from modules.url_scheme_converter import URLSchemeConverter
from modules.user_assets_viewer import UserAssetsViewer
from modules.utils import SetFooter
from modules.wordage_statistics_tool import WordageStatisticsTool

__version__ = "0.5.0"

DEBUG_MODE = False  # 调试模式

if DEBUG_MODE:
    host = "127.0.0.1"  # 本地地址
    port = "8602"
    print("调试模式已开启！")
else:
    host = "120.27.239.120"  # 服务器地址
    port = "8602"

status_to_text = {-1: "暂停服务", 0: "正常运行", 1: "降级运行"}

status_to_color = {-1: "#FF2D10", 0: "#008700", 1: "#FF8C00"}


def index():
    put_markdown(f"""
    # 简书小工具集
    为简友提供高效便捷的科技工具。
    Made with [JRT](https://github.com/FHU-yezi/JianshuResearchTools) and ♥
    Version：{__version__}
    """, lstrip=True)

    with open("config.json", "r", encoding="utf-8") as f:
        config = json.load(f)
    config.sort(key=lambda x: x["on_top"], reverse=True)  # 置顶的服务排在前面

    for service in config:
        put_markdown(f"## {service['title']}")

        if service["on_top"]:
            put_button("置顶", color="success", small=True, onclick=lambda: None)  # 显示置顶标签，点击无效果

        if service["status"] == 1:  # 降级运行状态
            put_warning("该服务处于降级运行状态，其性能可能受到影响，我们将尽力恢复其正常运行，感谢您的谅解")

        if service["notification"]:
            put_info(service["notification"])

        put_markdown(f"""
        {service["description"]}

        服务状态：<font color={status_to_color[service["status"]]}>**{status_to_text[service["status"]]}**</font>
        """, lstrip=True)

        if service["status"] >= 0:  # 只有服务正常运行时才允许跳转
            put_link("点击进入", url=f"http://{host}:{port}/?app={service['service_func_name']}")
            # TODO: 不明原因导致直接跳转报错，暂时避开该问题，等待修复
            # put_button("点击进入", color="success", onclick=lambda:go_app(app_name, new_window=False))

    SetFooter(f"Version {__version__}, Made with ♥")


start_server([
             index,
             UserAssetsViewer,
             URLSchemeConverter,
             ArticleDownloader,
             ArticleWordcloudGenerator,
             WordageStatisticsTool],
             port=8602)
