from datetime import datetime, timedelta
from functools import lru_cache
from typing import Callable, Dict, List, Tuple

from httpx import get as httpx_get
from JianshuResearchTools.convert import UserSlugToUserUrl
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article
from pywebio.output import put_markdown, use_scope
from pywebio.pin import pin, put_input
from sspeedup.cache.timeout import timeout_cache
from sspeedup.pywebio.callbacks import on_enter_pressed
from sspeedup.pywebio.html import green, grey, link, red
from sspeedup.pywebio.loading import green_loading
from sspeedup.pywebio.scope import use_clear_scope
from sspeedup.pywebio.toast import toast_error_and_return, toast_warn_and_return
from sspeedup.time_helper import human_readable_td_to_now

from utils.db import LP_collections_db, article_fp_rank_db
from utils.text_filter import input_filter
from widgets.button import put_button

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
    return (wordage >= 800, 800, wordage)


def reward_checker(article_obj: Article) -> Tuple[bool, float, float]:
    reward: float = article_obj.total_FP_count
    return (reward < 35.0, 35.0, reward)


def recommend_by_lp_last_7d_checker(article_obj: Article) -> Tuple[bool, int, int]:
    author_url: str = get_author_url(article_obj)
    recommend_by_lp_last_7d: int = LP_collections_db.count_documents(
        {
            "author.url": author_url,
            "fetch_date": {
                "$gt": datetime.now() - timedelta(days=7),
            },
        }
    )
    return (recommend_by_lp_last_7d == 0, 0, recommend_by_lp_last_7d)


def on_rank_last_10d_top30_checker(article_obj: Article) -> Tuple[bool, int, int]:
    author_url: str = get_author_url(article_obj)
    on_rank_last_10d_top30: int = article_fp_rank_db.count_documents(
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
    return (on_rank_last_10d_top30 == 0, 0, on_rank_last_10d_top30)


def on_rank_last_1m_top30_checker(article_obj: Article) -> Tuple[bool, int, int]:
    author_url: str = get_author_url(article_obj)
    on_rank_last_1m_top30: int = article_fp_rank_db.count_documents(
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
    return (on_rank_last_1m_top30 <= 2, 2, on_rank_last_1m_top30)


CHECK_ITEM_FUNC_MAPPING: Dict[str, Callable] = {
    "文章字数": wordage_checker,
    "文章收益": reward_checker,
    "作者过去 7 天被 LP 理事会推荐次数": recommend_by_lp_last_7d_checker,
    "作者过去 10 天前 30 名次数": on_rank_last_10d_top30_checker,
    "作者过去 1 个月前 30 名次数": on_rank_last_1m_top30_checker,
}


def on_check_button_clicked() -> None:
    url: str = input_filter(pin.url)  # type: ignore

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
        with use_clear_scope("result"):
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

        with use_clear_scope("detail"):
            for item_name, check_func in CHECK_ITEM_FUNC_MAPPING.items():
                passed, limit, actual = check_func(article)
                if not passed:
                    failed_items.append(item_name)

                put_markdown(
                    (green("通过") if passed else red("不通过"))
                    + " | "
                    + item_name
                    + grey(f"（限制：{limit}，实际：{actual}）")
                )

    # 由于 result scope 中已有内容，这里不能使用 use_clear_scope
    # 否则会清空原有内容
    with use_scope("result"):
        if not failed_items:
            put_markdown(green("**该文章符合推文要求**"))
        else:
            # 构建 Markdown 格式的列表
            failed_items_text: str = "- " + "\n- ".join(failed_items)
            put_markdown(red("**该文章不符合推文要求**"))
            put_markdown(f"未通过条件：\n{failed_items_text}")
            put_markdown("---")


def LP_recommend_checker() -> None:  # noqa
    put_input(
        "url",
        type="text",
        label="文章 URL",
    )
    put_button(
        "检测",
        color="success",
        onclick=on_check_button_clicked,
        block=True,
    )
    on_enter_pressed(
        "url",
        func=on_check_button_clicked,
    )
