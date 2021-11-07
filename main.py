import plotly.graph_objs as go
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
from pywebio.session import go_app
from qrcode import make as make_qrcode
from os import remove

__version__ = "0.1.0"
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

def index():
    put_markdown(f"""
    # 简书小工具集
    为简友提供高效便捷的科技工具。
    
    Made with [JRT](https://github.com/FHU-yezi/JianshuResearchTools) and ♥
    Version：{__version__}
    """, lstrip=True)
    
    put_markdown("""
    ## 用户资产查询工具
    查询用户的钻贝情况。
    
    服务状态：<font color=#008700>**正常运行**</font>
    """, lstrip=True)
    put_link("点击进入", url=f"http://{host}:{port}/?app=UserAssetsViewer")
    # TODO: 不明原因导致直接跳转报错，暂时避开该问题，等待修复
    # put_button("点击进入", color="success", onclick=lambda:go_app(UserAssetsViewer, new_window=False))
    
    put_markdown("""
    ## URL Scheme 转换工具
    将简书网页端 URL 转换成 URL Scheme 以实现一键跳转
    
    服务状态：<font color=#008700>**正常运行**</font>
    """, lstrip=True)
    put_link("点击进入", url=f"http://{host}:{port}/?app=URLSchemeCoverter")
    # TODO: 不明原因导致直接跳转报错，暂时避开该问题，等待修复
    # put_button("点击进入", color="success", onclick=lambda:go_app(URLSchemeCoverter, new_window=False))

start_server([index, UserAssetsViewer, URLSchemeCoverter], port=8602)
