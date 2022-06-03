from datetime import datetime

from config_manager import Config
from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article
from pywebio.output import put_button, put_markdown, toast, use_scope
from pywebio.pin import pin, put_input

from .utils import SetFooter, TimeDeltaFormat


def OnQueryButtonClicked():
    url = pin.url

    try:
        article = Article.from_url(url)
    except (InputError, ResourceError):
        toast("输入的 URL 无效，请检查", color="error")
        return

    article_title = article.title
    publish_time = article.publish_time.replace(tzinfo=None)
    update_time = article.update_time
    is_updated = "是" if publish_time != update_time else "否"
    publish_timedelta = datetime.now() - publish_time.replace(tzinfo=None)
    update_timedelta = datetime.now() - update_time.replace(tzinfo=None)

    with use_scope("output", clear=True):
        put_markdown("---")  # 分割线

        put_markdown(f"""
        # 查询结果
        文章标题：{article_title}
        发布时间：{publish_time}
        更新时间：{update_time}
        更新过：{is_updated}
        文章在 {TimeDeltaFormat(publish_timedelta)} 之前发布
        文章在 {TimeDeltaFormat(update_timedelta)} 之前更新过
        """)


def ArticleTimeQuery():
    """文章时间查询工具"""

    put_markdown("""
    # 文章时间查询工具
    查询文章的发布时间和更新时间。

    数据来自简书官方接口。
    """)

    put_input("url", label="请输入文章 URL：")
    put_button("查询", onclick=OnQueryButtonClicked)

    SetFooter(Config()["service_pages_footer"])
