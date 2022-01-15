from JianshuResearchTools.collection import GetCollectionArticlesInfo
from JianshuResearchTools.convert import (ArticleSlugToArticleUrl,
                                          ArticleUrlToArticleUrlScheme,
                                          UserSlugToUserUrl)
from pandas import DataFrame
from pywebio import pin
from pywebio.input import FLOAT, NUMBER
from pywebio.output import (put_button, put_collapse, put_column, put_link,
                            put_markdown, put_row, toast, use_scope)

from .utils import LinkInHTML, SetFooter

COLLECTIONS = {
    "简友广场": "https://www.jianshu.com/c/7ecac177f5a8",
    "人物": "https://www.jianshu.com/c/avQwgf",
    "想法": "https://www.jianshu.com/c/qQB2Zn"
}


def CheckData():
    all_data_right = True
    if not 1 <= pin.pin["likes_limit"] <= 10:
        toast("点赞数上限必须在 1 到 5 之间", color="error")
        all_data_right = False
    if not 1 <= pin.pin["comments_limit"] <= 10:
        toast("评论数上限必须在 1 到 5 之间", color="error")
        all_data_right = False
    if not 20 <= pin.pin["max_result_count"] <= 100:
        toast("结果数量必须在 20 到 100 之间", color="error")
        all_data_right = False
    if not pin.pin["chosen_collections"]:
        toast("请至少选择一个专题", color="error")
        all_data_right = False
    if not (pin.pin["fp_amount_limit"] == 0 or 0.1 <= pin.pin["fp_amount_limit"] <= 30.0):
        toast("文章获钻量限制必须在 0.1 到 30.0 之间", color="error")
        all_data_right = False
    return all_data_right


def GetProcessedData():
    chosen_collections_urls = []
    for chosen_collection in pin.pin["chosen_collections"]:
        chosen_collections_urls.append(COLLECTIONS[chosen_collection])
    raw_data = []
    for collection_url in chosen_collections_urls:
        for page in range(1, 7):
            raw_data.extend(GetCollectionArticlesInfo(collection_url, page))  # 默认获取 7 页
    df = DataFrame(raw_data)

    df = df[df["likes_count"] <= pin.pin["likes_limit"]]  # 根据点赞数筛选
    df = df[df["likes_count"] <= pin.pin["comments_limit"]]  # 根据评论数筛选
    if "仅展示可评论的文章" in pin.pin["additional_features"]:
        df = df[df["commentable"]]  # 筛选允许评论的文章
    if "不展示付费文章" in pin.pin["additional_features"]:
        df = df[[not x for x in df["paid"]]]  # 筛选不需要付费的文章
    if pin.pin["fp_amount_limit"] != 0:
        df = df[df["total_fp_amount"] <= pin.pin["fp_amount_limit"]]  # 根据获钻量筛选

    df = df[:pin.pin["max_result_count"]]  # 切片
    return df


def ShowResult(df):
    with use_scope("output", if_exist="remove"):  # 如果 scope 已存在，将其替换
        put_markdown("---")  # 分割线

        for _, item in df.iterrows():
            content = f"""链接：{ArticleSlugToArticleUrl(item.aslug)}
            作者：[{item.user["name"]}]({UserSlugToUserUrl(item.user["uslug"])})
            发布时间：{item.release_time.strftime(r"%Y-%m-%d %X")}
            阅读量：{item.views_count}
            点赞数：{item.likes_count}
            评论数：{item.comments_count}
            获钻量：{item.total_fp_amount}

            摘要：

            {item.summary}
            \n
            """
            if "开启 URL Scheme 跳转" in pin.pin["additional_features"]:  # 开启了 URL Scheme 跳转
                put_collapse(f"{item.title}", [put_markdown(content, lstrip=True), put_link("点击跳转到简书 App（手机端）", url=ArticleUrlToArticleUrlScheme(ArticleSlugToArticleUrl(item.aslug)))])
            else:
                put_collapse(f"{item.title}", put_markdown(content, lstrip=True))


def main_logic():
    if not CheckData():
        return  # 有数据填写错误，不运行后续逻辑
    df = GetProcessedData()
    toast("数据获取成功！", color="success")
    ShowResult(df)


def DiszeroerHelper():
    """简书消零派辅助工具

    消灭零评论，留下爱与光。
    """

    put_markdown("""
    # 简书消零派辅助工具

    **消灭零评论，留下爱与光。**

    本工具为辅助简书消零派寻找符合条件的文章而开发。

    请调整下方设置并获取文章列表。

    工作原理：在您选定的专题中查找新发布且赞、评少于一定数量的文章，进行处理后展示到页面上。
    """, lstrip=True)  # 去除无用的空格

    put_markdown("---")  # 分割线

    put_row([
        put_column([
            pin.put_input("likes_limit", label="点赞数上限", type=NUMBER, value=3, help_text="介于 1 到 10 之间"), None,
            pin.put_input("comments_limit", label="评论数上限", type=NUMBER, value=3, help_text="介于 1 到 10 之间"), None,
            pin.put_input("max_result_count", label="结果数量", type=NUMBER, value=20, help_text="介于 20 到 100 之间")
        ]), None,
        put_column([
            pin.put_checkbox("chosen_collections", label="专题选择", options=COLLECTIONS.keys()),
            pin.put_checkbox("additional_features", label="高级选项", options=["开启 URL Scheme 跳转", "仅展示可评论的文章", "不展示付费文章"]),
            pin.put_input("fp_amount_limit", type=FLOAT, label="文章获钻量限制", value=0.0, help_text="介于 0.1 到 30.0 之间，0 为关闭")
        ])
    ], size=r"3fr 1fr 3fr")

    put_button("提交", color="success", onclick=main_logic)

    SetFooter(f"Powered By \
              {LinkInHTML('JRT', 'https://github.com/FHU-yezi/JianshuResearchTools/')} \
              and {LinkInHTML('PyWebIO', 'https://github.com/pywebio/PyWebIO')}")
