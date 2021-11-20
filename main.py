import os
from collections import Counter

try:
    import simplejson as json
except ImportError:
    import json

from re import findall, search, sub

import jieba
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
from PIL import Image
from pywebio import pin, start_server
from pywebio.input import *
from pywebio.output import *
from pywebio.session import download, go_app, run_js
from qrcode import make as make_qrcode
from wordcloud import WordCloud

__version__ = "0.4.0"

DEBUG_MODE = True  # 调试模式

if DEBUG_MODE:
    host = "127.0.0.1"  # 本地地址
    port = "8602"
    print("调试模式已开启！")
else:
    host = "120.27.239.120"  # 服务器地址
    port = "8602"

status_to_text = {
        -1: "暂停服务", 
        0: "正常运行", 
        1: "降级运行"
    }

status_to_color = {
        -1: "#FF2D10", 
        0: "#008700", 
        1: "#FF8C00"
    }

jieba.setLogLevel(jieba.logging.ERROR)  # 关闭 jieba 的日志输出

stopwords = [word for word in open("stopwords.txt", encoding="utf-8")]  # 预加载停用词词库
[jieba.add_word(word) for word in open("hotwords.txt", encoding="utf-8")]  # 将热点词加入词库

def LinkInHTML(name: str, link: str):
    """
    获取 HTML 格式的链接
    """
    return f'<a href="{link}" style="color: #0056B3">{name}</a>'
    

def SetFooter(html: str):
    """
    设置底栏内容
    """
    run_js(f"$('footer').html('{html}')")

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
    
    SetFooter(f"Powered By \
        {LinkInHTML('JRT', 'https://github.com/FHU-yezi/JianshuResearchTools/')} \
        and {LinkInHTML('PyWebIO', 'https://github.com/pywebio/PyWebIO')}")

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
            
            img = make_qrcode(result)._img
            put_image(img)
    
    put_markdown("""
    # URL Scheme 转换工具
    
    本工具可将简书网页端的链接转换成简书 App 端的 URL Scheme，从而实现一键跳转。
    """, lstrip=True)
    pin.put_input("url", label="网页端 URL", type=TEXT)
    put_button("转换", onclick=Convert)
    
    SetFooter(f"Powered By \
        {LinkInHTML('JRT', 'https://github.com/FHU-yezi/JianshuResearchTools/')} \
        and {LinkInHTML('PyWebIO', 'https://github.com/pywebio/PyWebIO')}")

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
        
        remove(filename)  # 删除临时文件
        
    
    put_markdown("""
    # 文章下载工具
    本工具可下载简书中的文章内容，并将其保存至本地。
    
    **请注意：本工具可以下载设置为禁止转载的文章内容，您需自行承担不规范使用可能造成的版权风险。**
    """, lstrip=True)
    
    pin.put_input("url", type=TEXT, label="要下载的文章链接")
    pin.put_checkbox("warning", options=["我已阅读以上提示并将合规使用文章内容"])
    put_button("下载纯文本格式", onclick=lambda: download_content("txt"))
    put_button("下载 Markdown 格式", onclick=lambda: download_content("markdown"))
    
    SetFooter(f"Powered By \
        {LinkInHTML('JRT', 'https://github.com/FHU-yezi/JianshuResearchTools/')} \
        and {LinkInHTML('PyWebIO', 'https://github.com/pywebio/PyWebIO')}")

def ArticleWordcloudGenerator():
    """文章词云图生成工具"""
    
    def GeneratorWordcloud():
        try:
            AssertArticleUrl(pin.pin["url"])
        except InputError:
            toast("输入的 URL 无效，请检查", color="error")
            return # 发生错误，不再运行后续逻辑
        
        text = GetArticleText(pin.pin["url"])
        cutted_text = jieba.cut(text)
        cutted_text = [word for word in cutted_text if len(word) > 1 and word not in stopwords]
        wordcloud = WordCloud(font_path="font.otf", width=1280, 
                              height=720, background_color="white")
        img = wordcloud.generate_from_frequencies(Counter(cutted_text))
        img = Image.fromarray(img.to_array())
        put_image(img)
        
    put_markdown("""
    # 文章词云图生成工具
    本工具可生成简书文章的词云图。
    """, lstrip=True)
    
    pin.put_input("url", type=TEXT, label="文章链接")
    put_button("生成词云图", GeneratorWordcloud)
    
    SetFooter(f"Powered By \
        {LinkInHTML('JRT', 'https://github.com/FHU-yezi/JianshuResearchTools/')} \
        and {LinkInHTML('PyWebIO', 'https://github.com/pywebio/PyWebIO')}")

def WordageStatisticsTool():
    """文章字数统计工具"""
    
    # 这些字符无论输入多少次，都不计入字数统计
    NotCountingChars = ("`", "~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", 
                        "+", "[", "]", ";", "'", ",", ".", "/", "?", "\"", "{", "}", "（", "）", "-", " ")
    
    # 这些字符如果重复输入多次，只算作一个字
    # 包含英文字母和数字
    CountingOneTimeChars = ("_", "[a-zA-z]", "[0-9]")
    
    TextToReplace = "ꞏ"  # 只算作一个字的字符将被替换成该字符，以便统计
    
    # 这些字符不应该出现在文章中（例如零宽空格）
    DislikeChars = ("​", "‌", "‍", "‎", "‏")
    
    
    def StatisticsWordage():
        text = pin.pin["text"]  # 定义局部变量引用，提高性能
        
        while "\n" in text:
            text = text.replace("\n", "")  # 去除换行符
            
        if not text:
            toast("请输入文本", color="error")
            return  # 发生错误，不再运行后续逻辑
        
        TotalCharsCount = len(text)
        
        MarkdownIgnoredChars = 0  # Markdown 语法中的被忽略字符数
        MarkdownTextChars = 0  # Markdown 语法中实际计入的字符数
        MarkdownImages = findall("!\[.*?\]\(.*?\)", text)  # 查找 Markdown 中的图片
        for image in MarkdownImages:
            text = text.replace(image, "")
            find_result = search("\[(?P<result>.+)\]", image)
            if find_result:
                find_result = find_result.group("result")
            MarkdownIgnoredChars += len(image)
            if find_result:
                for char in NotCountingChars:
                    find_result = find_result.replace(char, "")
                MarkdownTextChars += len(find_result)

        MarkdownUrls = findall("\[.*?\]\(.*?\)", text)  # 查找 Markdown 中的链接

        for url in MarkdownUrls:
            text = text.replace(url, "")
            find_result = search("\[(?P<result>.+)\]", url)
            if find_result:
                find_result = find_result.group("result")
            MarkdownIgnoredChars += len(url)
            if find_result:
                for char in NotCountingChars:
                    find_result = find_result.replace(char, "")
                MarkdownTextChars += len(find_result)
        
        NotCountingCharsCount = 0
        for char in NotCountingChars:
            NotCountingCharsCount += text.count(char)
            
        CountingOneTimeCharsCount = 0  # 仅计算一次的字符个数
        RealCountCharsCount = 0  # 这些字符实际计入的字符数
        text_copy = text[:]  # 创建字符串的副本
        for char in CountingOneTimeChars:
            text_copy = sub(char, TextToReplace, text_copy)  # 将所有只出现一次的字符替换成占位符
            
        find_result = [x for x in findall(f"{TextToReplace}+", text_copy) if len(x) > 1]  # 如果该字符仅出现一次，将其忽略
        CountingOneTimeCharsCount += len("".join(find_result))  # 将查找结果进行合并，获取其长度
        RealCountCharsCount += len(find_result)
    
        
            
        DislikeCharsCount = 0
        for char in DislikeChars:
            DislikeCharsCount += text.count(char)
        
        WordageInJianshu = (TotalCharsCount - NotCountingCharsCount 
                            - CountingOneTimeCharsCount - MarkdownIgnoredChars 
                            + MarkdownTextChars + RealCountCharsCount)
        
        toast("统计完成", color="success")
        with use_scope("output", if_exist="replace"):
            put_markdown(f"""
            # 字数统计信息
            总字符数：{TotalCharsCount}
            不计入统计的字符数：{NotCountingCharsCount}
            仅计算一次的字符数：{CountingOneTimeCharsCount} -> {RealCountCharsCount}
            Markdown 语法字符数：{MarkdownIgnoredChars} -> {MarkdownTextChars}
            **简书内显示的字数：{WordageInJianshu}**

            """, lstrip=True)
            
    put_markdown("""
    # 文章字数统计工具
    提供文章字数统计与建议。
    使用 Markdown 撰写文章，可获得更多统计维度数据。
    """, lstrip=True)
    
    pin.put_textarea("text", label="文章内容", rows=12, placeholder="在此处输入...")
    put_button("统计", StatisticsWordage)

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
            put_button("置顶", color="success", small=True, onclick=lambda:None)  # 显示置顶标签，点击无效果
        
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
        
start_server([index, UserAssetsViewer, URLSchemeCoverter, 
              ArticleDownloader, ArticleWordcloudGenerator, WordageStatisticsTool], port=8602)
