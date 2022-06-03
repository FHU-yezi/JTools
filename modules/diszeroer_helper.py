from typing import Dict, List

from config_manager import Config
from JianshuResearchTools.collection import GetCollectionAllArticlesInfo
from JianshuResearchTools.convert import (ArticleSlugToArticleUrl,
                                          ArticleUrlToArticleUrlScheme,
                                          UserSlugToUserUrl)
from pywebio.input import FLOAT, NUMBER
from pywebio.output import (put_button, put_collapse, put_column, put_link,
                            put_loading, put_markdown, put_row, toast,
                            use_scope)
from pywebio.pin import pin, put_checkbox, put_input

from .utils import SetFooter

COLLECTIONS = {
    "简友广场": "https://www.jianshu.com/c/7ecac177f5a8",
    "人物": "https://www.jianshu.com/c/avQwgf",
    "想法": "https://www.jianshu.com/c/qQB2Zn"
}


def CheckData():
    if not 1 <= pin.likes_limit <= 10:
        toast("点赞数上限必须在 1 到 5 之间", color="error")
        return False
    if not 1 <= pin.comments_limit <= 10:
        toast("评论数上限必须在 1 到 5 之间", color="error")
        return False
    if not 20 <= pin.max_result_count <= 100:
        toast("结果数量必须在 20 到 100 之间", color="error")
        return False
    if not pin.chosen_collections:
        toast("请至少选择一个专题", color="error")
        return False
    if not (pin.FP_amount_limit == 0 or 0.1 <= pin.FP_amount_limit <= 30.0):
        toast("文章获钻量限制必须在 0.1 到 30.0 之间", color="error")
        return False
    return True


def GetProcessedData():
    likes_limit = pin.likes_limit
    comments_limit = pin.comments_limit
    enable_FP_amount_limit = not pin.FP_amount_limit == 0
    FP_amount_limit = pin.FP_amount_limit
    only_commentable = "仅展示可评论的文章" in pin.additional_features
    no_paid = "不展示付费文章" in pin.additional_features
    max_result_count = pin.max_result_count

    chosen_collections_urls = [
        COLLECTIONS[chosen_collection]
        for chosen_collection in pin.chosen_collections
    ]

    data: List[Dict] = []
    try:
        for collection_url in chosen_collections_urls:
            for item in GetCollectionAllArticlesInfo(collection_url, disable_check=True, max_count=100):
                if item["likes_count"] >= likes_limit:
                    continue
                if item["comments_count"] >= comments_limit:
                    continue
                if enable_FP_amount_limit and item["total_fp_amount"] >= FP_amount_limit:
                    continue
                if only_commentable and not item["commentable"]:
                    continue
                if no_paid and item["paid"]:
                    continue
                data.append(item)

                if len(data) == max_result_count:
                    raise Exception  # 终止外层循环
    except Exception:  # 捕获循环终止错误
        pass

    return data


def ShowResult(data: List[Dict]):
    enbale_URL_Scheme = "开启 URL Scheme 跳转" in pin.additional_features

    with use_scope("output", clear=True):
        put_markdown("---")  # 分割线

        for item in data:
            content = f"""链接：{ArticleSlugToArticleUrl(item['aslug'])}
            作者：[{item['user']["name"]}]({UserSlugToUserUrl(item['user']['uslug'])})
            发布时间：{item['release_time'].strftime(r"%Y-%m-%d %X")}
            阅读量：{item['views_count']}
            点赞数：{item['likes_count']}
            评论数：{item['comments_count']}
            获钻量：{item['total_fp_amount']}

            摘要：

            {item['summary']}
            """
            if enbale_URL_Scheme:
                put_collapse(f"{item['title']}", [
                    put_markdown(content),
                    put_link("点击跳转到简书 App（手机端）",
                             url=ArticleUrlToArticleUrlScheme(
                                 ArticleSlugToArticleUrl(item['aslug'])))
                ])
            else:
                put_collapse(f"{item['title']}", put_markdown(content))


def OnSubmitButtonClicked():
    if not CheckData():
        return
    with put_loading(color="success"):  # 显示加载动画
        data = GetProcessedData()
    toast("数据获取成功！", color="success")
    ShowResult(data)


def DiszeroerHelper():
    """简书小工具集：消零派辅助工具
    """

    put_markdown("""
    # 消零派辅助工具

    **消灭零评论，留下爱与光。**

    本工具为辅助简书消零派寻找符合条件的文章而开发。

    请调整下方设置并获取文章列表。

    工作原理：在您选定的专题中查找新发布且赞、评少于一定数量的文章，进行处理后展示到页面上。
    """)

    put_markdown("---")  # 分割线

    put_row([
        put_column([
            put_input("likes_limit", label="点赞数上限", type=NUMBER,
                      value=3, help_text="介于 1 到 10 之间"), None,
            put_input("comments_limit", label="评论数上限", type=NUMBER,
                      value=3, help_text="介于 1 到 10 之间"), None,
            put_input("max_result_count", label="结果数量", type=NUMBER,
                      value=20, help_text="介于 20 到 100 之间")
        ]), None,
        put_column([
            put_checkbox("chosen_collections", label="专题选择",
                         options=COLLECTIONS.keys()),
            put_checkbox("additional_features", label="高级选项",
                         options=["开启 URL Scheme 跳转", "仅展示可评论的文章", "不展示付费文章"]),
            put_input("FP_amount_limit", type=FLOAT, label="文章获钻量限制",
                      value=0.0, help_text="介于 0.1 到 30.0 之间，0 为关闭")
        ])
    ], size=r"3fr 1fr 3fr")

    put_button("提交", color="success", onclick=OnSubmitButtonClicked)

    SetFooter(Config()["service_pages_footer"])
