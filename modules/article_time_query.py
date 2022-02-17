from datetime import datetime

from config_manager import Config
from JianshuResearchTools.article import (GetArticlePublishTime,
                                          GetArticleTitle,
                                          GetArticleUpdateTime)
from JianshuResearchTools.assert_funcs import (AssertArticleStatusNormal,
                                               AssertArticleUrl)
from JianshuResearchTools.exceptions import InputError, ResourceError
from pywebio.output import put_button, put_markdown, toast, use_scope
from pywebio.pin import pin, put_input

from .utils import SetFooter


def TimeDeltaFormat(td_object):
    seconds = int(td_object.total_seconds())
    periods = (
        ("年", 60*60*24*365),
        ("月", 60*60*24*30),
        ("天", 60*60*24),
        ("小时", 60*60),
        ("分钟", 60),
        ("秒", 1)
    )

    strings = []
    for period_name, period_seconds in periods:
        if seconds > period_seconds:
            period_value, seconds = divmod(seconds, period_seconds)
            strings.append(f"{period_value} {period_name}")

    return " ".join(strings)


def QueryUserVIPInfo():
    url = pin["url"]
    try:
        AssertArticleUrl(url)
        AssertArticleStatusNormal(url)
    except (InputError, ResourceError):
        toast("输入的 URL 无效，请检查", color="error")
        return  # 发生错误，不再运行后续逻辑
    else:
        article_title = GetArticleTitle(url, disable_check=True)
        publish_time = GetArticlePublishTime(url, disable_check=True).replace(tzinfo=None)
        update_time = GetArticleUpdateTime(url, disable_check=True)
        is_updateed = "是" if publish_time != update_time else "否"
        publish_timedelta = datetime.now() - publish_time.replace(tzinfo=None)
        update_timedelta = datetime.now() - update_time.replace(tzinfo=None)

    with use_scope("output", clear=True):
        put_markdown("---")  # 分割线

        put_markdown(f"""
        # 查询结果
        文章标题：{article_title}
        发布时间：{publish_time}
        更新时间：{update_time}
        更新过：{is_updateed}
        文章在 {TimeDeltaFormat(publish_timedelta)} 之前发布
        文章在 {TimeDeltaFormat(update_timedelta)} 之前最后一次更新
        """)


def ArticleTimeQuery():
    """文章时间查询工具"""

    put_markdown("""
    # 文章时间查询工具
    查询文章的发布时间和更新时间。

    数据来自简书官方接口。
    """)

    put_input("url", label="请输入文章 URL：")
    put_button("查询", onclick=QueryUserVIPInfo)

    SetFooter(Config()["service_pages_footer"])
