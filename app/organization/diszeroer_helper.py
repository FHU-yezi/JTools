from datetime import datetime
from typing import Dict, Generator, List, Tuple

from JianshuResearchTools.convert import (ArticleSlugToArticleUrl,
                                          ArticleUrlToArticleUrlScheme,
                                          UserSlugToUserUrl)
from JianshuResearchTools.objects import Collection
from pywebio.output import (put_button, put_collapse, put_column, put_link,
                            put_loading, put_markdown, put_row, toast,
                            use_scope)
from pywebio.pin import pin, put_checkbox, put_input
from utils.checkbox_helper import is_checked
from utils.human_readable_td import human_readable_td

NAME: str = "消零派辅助工具"
DESC: str = "消灭零评论，留下爱与光。"

COLLECTIONS: Dict[str, Collection] = {
    "简友广场": Collection.from_url("https://www.jianshu.com/c/7ecac177f5a8"),
    "人物": Collection.from_url("https://www.jianshu.com/c/avQwgf"),
    "想法": Collection.from_url("https://www.jianshu.com/c/qQB2Zn")
}


def check_user_input(likes_limit: int, comments_limit: int, max_result_count: int,
                     selected_collections: List[str]) -> Tuple[bool, str]:
    if not 1 <= likes_limit <= 20:
        return (False, "点赞数上限必须在 1 到 20 之间")
    if not 1 <= comments_limit <= 10:
        return (False, "评论数上限必须在 1 到 10 之间")
    if not 20 <= max_result_count <= 100:
        return (False, "结果数量必须在 20 到 100 之间")
    if not selected_collections:
        return (False, "请至少选择一个专题")

    return (True, "")


def iter_selected_collections(selected_collections: List[str]) \
        -> Generator[Tuple[Dict, str], None, None]:
    collection_objs: List[Collection] = [COLLECTIONS[x] for x in selected_collections]
    collection_now_pages: List[int] = [0] * len(collection_objs)

    while True:
        for index, collection in enumerate(collection_objs):
            now_page = collection_now_pages[index]
            for item in collection.articles_info(page=now_page):
                yield (item, list(COLLECTIONS.keys())[index])  # 返回文章信息与对应的专题名称
            collection_now_pages[index] += 1


def fit_for_filter(likes_limit: int, comments_limit: int,
                   show_commentable_only: bool, no_paid_article: bool,
                   likes_count, comments_count,
                   commentable: bool, paid: bool) -> bool:
    if likes_count > likes_limit:
        return False
    if comments_count > comments_limit:
        return False
    if show_commentable_only and not commentable:
        return False
    if no_paid_article and paid:
        return False

    return True


def on_fetch_button_clicked() -> None:
    likes_limit: int = pin.likes_limit
    comments_limit: int = pin.comments_limit
    max_result_count: int = pin.max_result_count
    selected_collections: List[str] = pin.selected_collections

    show_commentable_only: bool = is_checked("仅展示允许评论的文章", pin.additional_features)
    no_paid_article: bool = is_checked("不展示付费文章", pin.additional_features)
    enable_URL_scheme: bool = is_checked("开启 URL Scheme 跳转", pin.additional_features)

    user_input_ok, message = check_user_input(likes_limit, comments_limit, max_result_count, selected_collections)
    if not user_input_ok:
        toast(message, color="error")
        return

    showed_count: int = 0

    with put_loading(color="success"):
        with use_scope("result", clear=True):
            for article, source_collection in iter_selected_collections(selected_collections):
                article_title: str = article["title"]
                article_URL: str = ArticleSlugToArticleUrl(article["aslug"])
                author_name: str = article["user"]["name"]
                author_URL: str = UserSlugToUserUrl(article["user"]["uslug"])
                URL_scheme = (ArticleUrlToArticleUrlScheme(article_URL)
                              if enable_URL_scheme else None)
                release_time: datetime = article["release_time"].replace(tzinfo=None)  # 处理时区问题
                views_count: int = article["views_count"]
                likes_count: int = article["likes_count"]
                comments_count: int = article["comments_count"]
                total_FP_amount: int = article["total_fp_amount"]
                summary: str = article["summary"]
                commentable: bool = article["commentable"]
                paid: bool = article["paid"]

                if fit_for_filter(likes_limit, comments_limit, show_commentable_only, no_paid_article,
                                  likes_count, comments_count, commentable, paid):
                    showed_count += 1
                    put_collapse(
                        title=f"[ {source_collection} ] {article_title}",
                        content=[put_markdown(f"""
                        文章链接：[{article_URL}]({article_URL})
                        作者：[{author_name}]({author_URL})
                        发布时间：{release_time.strftime(r"%Y-%m-%d %X")}（{human_readable_td(datetime.now() - release_time, accurate=False)}前）

                        {views_count} 阅读 / {likes_count} 点赞 / {comments_count} 评论
                        获钻量：{total_FP_amount}

                        内容摘要：
                        {summary}
                        """), put_link("点击跳转到简书 App", URL_scheme) if enable_URL_scheme else ""]
                    )

                    if showed_count == max_result_count:
                        break


def diszeroer_helper() -> None:
    put_markdown("""
    数据来自简书官方接口。

    请调整下方选项，然后点击"获取文章列表"。

    ---
    """)

    put_row([
        put_column([
            put_input("likes_limit", label="点赞数上限", type="number",
                      value=5, help_text="介于 1 到 20 之间，超过该限制的文章将不会展示"), None,
            put_input("comments_limit", label="评论数上限", type="number",
                      value=3, help_text="介于 1 到 10 之间，超过该限制的文章将不会展示"), None,
            put_input("max_result_count", label="结果数量", type="number",
                      value=20, help_text="介于 20 到 100 之间")
        ]), None,
        put_column([
            put_checkbox("selected_collections", label="专题选择",
                         options=COLLECTIONS.keys()),
            put_checkbox("additional_features", label="高级选项",
                         options=["仅展示允许评论的文章", "不展示付费文章", "开启 URL Scheme 跳转"]),
        ])
    ], size=r"3fr 1fr 3fr")

    put_button("获取文章列表", color="success", onclick=on_fetch_button_clicked)
