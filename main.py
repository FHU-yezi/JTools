<<<<<<< HEAD
import os

import plotly.graph_objs as go
from JianshuResearchTools.article import (GetArticleAuthorName,
                                          GetArticleMarkdown, GetArticleText,
                                          GetArticleTitle)
from JianshuResearchTools.assert_funcs import (AssertArticleUrl,
                                               AssertCollectionUrl,
                                               AssertJianshuUrl,
                                               AssertNotebookUrl,
                                               AssertUserStatusNormal,
                                               AssertUserUrl)
from JianshuResearchTools.convert import (ArticleUrlToArticleUrlScheme,
                                          CollectionUrlToCollectionUrlScheme,
                                          NotebookUrlToNotebookUrlScheme,
                                          UserUrlToUserUrlScheme)
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.user import (GetUserAssetsCount, GetUserFPCount,
                                       GetUserFTNCount, GetUserName)
from pywebio import pin, start_server
from pywebio.input import *
from pywebio.output import *
from pywebio.session import download, go_app
from qrcode import make as make_qrcode

__version__ = "0.2.0"
host = "120.27.239.120"
port = "8602"

def UserAssetsViewer():
    """简书小工具集：用户资产查询工具"""
    def ShowUserAssetsInfo():
        with use_scope("output", if_exist="replace"):
            try:
                AssertUserUrl(pin.pin["user_url"])
                AssertUserStatusNormal(pin.pin["user_url"])
            except (InputError, ResourceError):
                toast("用户主页 URL 无效，请检查", color="error")
                return  # 发生错误，不再运行后续逻辑
        
        user_name = GetUserName(pin.pin["user_url"])
        FP = GetUserFPCount(pin.pin["user_url"])
        assets = GetUserAssetsCount(pin.pin["user_url"])
        FTN = round(assets - FP, 3)

        toast("数据获取成功", color="success")
        if FTN < 0 and assets >= 10000:
            put_warning("该用户简书贝占比过少，简书贝信息可能出错")
        
        with use_scope("output", if_exist="replace"):
            put_markdown(f"""
            # {user_name} 的资产信息
            简书钻：{FP}
            简书贝：{FTN}
            总资产：{assets}
            钻贝比：{round(FP / FTN, 2)}
            """, lstrip=True)
            
            fig = go.Figure(data=[go.Pie(labels=["简书钻（FP）", "简书贝（FTN）"], values=[FP, FTN], title="用户资产占比")])
            put_html(fig.to_html(include_plotlyjs="require", full_html=False))  # 获取 HTML 并展示
        
    
    put_markdown("""
    # 用户资产查询工具
    """, lstrip=True)
    
    pin.put_input("user_url", label="用户主页 URL", type=TEXT)
    put_button("查询", ShowUserAssetsInfo)

def URLSchemeCoverter():
    """简书小工具集：URL Scheme 转换工具"""
    def CheckData():
        try:
            AssertJianshuUrl(pin.pin["url"])
        except InputError:
            toast("输入的链接无效，请检查", color="error")
            return False
        
        error_count = 0
        assert_funcs = (AssertUserUrl, AssertArticleUrl, AssertCollectionUrl, AssertNotebookUrl)
        for assert_func in assert_funcs:
            try:
                assert_func(pin.pin["url"])
            except InputError:
                error_count += 1
        if error_count != len(assert_funcs) - 1:
            toast("输入的链接无效，请检查", color="error")
            return False
        return True

    def Convert():
        if not CheckData():
            return  # 发生错误，不再运行后续逻辑
        with use_scope("output", if_exist="replace"):
            convert_funcs = (ArticleUrlToArticleUrlScheme,
                             CollectionUrlToCollectionUrlScheme,
                             NotebookUrlToNotebookUrlScheme,
                             UserUrlToUserUrlScheme)
            for convert_func in convert_funcs:
                try:
                    result = convert_func(pin.pin["url"])
                except InputError:
                    continue
                else:
                    break
                
            put_markdown("---")  # 分割线

            put_markdown("**转换结果**：")
            put_link(name=result, url=result)
            
            # TODO: 避免保存临时文件
            make_qrcode(result).save("temp.png")
            with open("temp.png", "rb") as f:
                put_image(f.read())
            remove("temp.png")
    
    put_markdown("""
    # URL Scheme 转换工具
    
    本工具可将简书网页端的链接转换成简书 App 端的 URL Scheme，从而实现一键跳转。
    """, lstrip=True)
    pin.put_input("url", label="网页端 URL", type=TEXT)
    put_button("转换", onclick=Convert)

def ArticleDownloader():
    """简书小工具集：文章下载工具"""
    def download_content(format):
        if format not in ["txt", "markdown"]:
            toast("格式无效，请检查", color="error")
            return  # 发生错误，不再运行后续逻辑
        if "我已阅读以上提示并将合规使用文章内容" not in pin.pin["warning"]:
            toast("请先勾选免责信息", color="error")
            return # 用户未勾选免责，不再运行后续逻辑
        try:
            AssertArticleUrl(pin.pin["url"])
        except InputError:
            toast("输入的 URL 无效，请检查")
            return # 发生错误，不再运行后续逻辑
        if format == "txt":
            filename = GetArticleTitle(pin.pin["url"]) + "_" + GetArticleAuthorName(pin.pin["url"]) + ".txt"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(GetArticleText(pin.pin["url"]))
        elif format == "markdown":
            filename = GetArticleTitle(pin.pin["url"]) + "_" + GetArticleAuthorName(pin.pin["url"]) + ".md"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(GetArticleMarkdown(pin.pin["url"]))
        
        toast("文章内容获取成功", color="success")
        with open(filename, "rb") as f:
            download(filename, f.read())  # 向浏览器发送文件下载请求
        
        os.remove(filename)
    
    put_markdown("""
    # 文章下载工具
    本工具可下载简书中的文章内容，并将其保存至本地。
    
    **请注意：本工具可以下载设置为禁止转载的文章内容，您需自行承担不规范使用可能造成的版权风险。**
    """, lstrip=True)
    
    pin.put_input("url", type=TEXT, label="要下载的文章链接")
    pin.put_checkbox("warning", options=["我已阅读以上提示并将合规使用文章内容"])
    put_button("下载纯文本格式", onclick=lambda: download_content("txt"))
    put_button("下载 Markdown 格式", onclick=lambda: download_content("markdown"))

def index():
    """简书小工具集"""
    put_markdown(f"""
    # 简书小工具集
    让技术工具更平常。
    
=======
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
