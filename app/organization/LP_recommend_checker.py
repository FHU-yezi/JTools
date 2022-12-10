from datetime import datetime, timedelta
from functools import lru_cache
from typing import Callable, Dict, List, Tuple

from httpx import get as httpx_get
from JianshuResearchTools.convert import UserSlugToUserUrl
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article
from pywebio.output import put_button, put_markdown, use_scope
from pywebio.pin import pin, put_input

from utils.cache import timeout_cache
from utils.callback import bind_enter_key_callback
from utils.db import article_FP_rank_db
from utils.html import green_text, grey_text, link, red_text
from utils.text_filter import input_filter
from utils.time_helper import human_readable_td_to_now
from utils.widgets import (
    green_loading,
    toast_error_and_return,
    toast_warn_and_return,
    use_result_scope,
)

NAME: str = "LP 理事会推文检测工具"
DESC: str = "检测文章是否符合 LP 理事会推文要求。"


@lru_cache(10)
def get_author_url(article_obj: Article) -> str:
    response = httpx_get(f"https://www.jianshu.com/asimov/p/{article_obj.slug}")
    data = response.json()
    return UserSlugToUserUrl(data["user"]["slug"])


@timeout_cache(300)
def get_article_wordage(article_obj: Article) -> str:
    response = httpx_get(f"https://www.jianshu.com/asimov/p/{article_obj.slug}")
    data = response.json()
    return UserSlugToUserUrl(data["wordage"])


def wordage_checker(article_obj: Article) -> Tuple[bool, int, int]:
    wordage: int = article_obj.wordage
    return (True if wordage >= 800 else False, 800, wordage)


def reward_checker(article_obj: Article) -> Tuple[bool, float, float]:
    reward: float = article_obj.total_FP_count
    return (True if reward < 35.0 else False, 35.0, reward)


def on_rank_last_7d_checker(article_obj: Article) -> Tuple[bool, int, int]:
    author_url: str = get_author_url(article_obj)
    on_rank_last_7d: int = article_FP_rank_db.count_documents(
        {
            "author.url": author_url,
            "date": {
                "$gt": datetime.now() - timedelta(days=7),
            },
        }
    )
    return (True if on_rank_last_7d == 0 else False, 0, on_rank_last_7d)


def on_rank_last_10d_top30_checker(article_obj: Article) -> Tuple[bool, int, int]:
    author_url: str = get_author_url(article_obj)
    on_rank_last_10d_top30: int = article_FP_rank_db.count_documents(
        {
            "author.url": author_url,
            "date": {
                "$gt": datetime.now() - timedelta(days=10),
            },
            "ranking": {
                "$lte": 30,
            },
        }
    )
    return (True if on_rank_last_10d_top30 == 0 else False, 0, on_rank_last_10d_top30)


def on_rank_last_1m_top30_checker(article_obj: Article) -> Tuple[bool, int, int]:
    author_url: str = get_author_url(article_obj)
    on_rank_last_1m_top30: int = article_FP_rank_db.count_documents(
        {
            "author.url": author_url,
            "date": {
                "$gt": datetime.now() - timedelta(days=30),
            },
            "ranking": {
                "$lte": 30,
            },
        }
    )
    return (True if on_rank_last_1m_top30 <= 2 else False, 2, on_rank_last_1m_top30)


CHECK_ITEM_FUNC_MAPPING: Dict[str, Callable] = {
    "文章字数": wordage_checker,
    "文章收益": reward_checker,
    "作者过去 7 天上榜次数": on_rank_last_7d_checker,
    "作者过去 10 天前 30 名次数": on_rank_last_10d_top30_checker,
    "作者过去 1 个月前 30 名次数": on_rank_last_1m_top30_checker,
}


def on_check_button_clicked() -> None:
    url: str = input_filter(pin.url)

    if not url:
        toast_warn_and_return("请输入简书文章 URL")

    try:
        article = Article.from_url(url)
    except InputError:
        toast_error_and_return("输入的不是简书文章 URL")
    except ResourceError:
        toast_error_and_return("文章已被删除、锁定或正在审核中，无法获取内容")

    failed_items: List[str] = []

    with green_loading():
        with use_result_scope():
            # 必须传入 sanitize=False 禁用 XSS 攻击防护
            # 否则 target="_blank" 属性会消失，无法实现新标签页打开
            put_markdown(
                f"""
                文章标题：{link(article.title, article.url, new_window=True)}
                发布时间：{article.publish_time.replace(tzinfo=None)}（{
                    human_readable_td_to_now(article.publish_time.replace(tzinfo=None))
                }前）
                """,
                sanitize=False,
            )

        with use_scope("detail", clear=True):
            for item_name, check_func in CHECK_ITEM_FUNC_MAPPING.items():
                passed, limit, actual = check_func(article)
                if not passed:
                    failed_items.append(item_name)

                put_markdown(
                    (green_text("通过") if passed else red_text("不通过"))
                    + " | "
                    + item_name
                    + grey_text(f"（限制：{limit}，实际：{actual}）")
                )

    # 由于 result scope 中已有内容，这里不能使用 use_result_scope
    # 否则会清空原有内容
    with use_scope("result"):
        if not failed_items:
            put_markdown(green_text("**该文章符合推文要求**"))
        else:
            # 构建 Markdown 格式的列表
            failed_items_text: str = "- " + "\n- ".join(failed_items)
            put_markdown(red_text("**该文章不符合推文要求**"))
            put_markdown(f"未通过条件：\n{failed_items_text}")
            put_markdown("---")


def LP_recommend_checker() -> None:
    put_input(
        "url",
        type="text",
        label="文章 URL",
    )
    put_button(
        "检测",
        color="success",
        onclick=on_check_button_clicked,
    )
    bind_enter_key_callback(
        "url",
        on_press=lambda _: on_check_button_clicked(),
    )
