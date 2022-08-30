from datetime import datetime

from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article
from pywebio.output import (put_button, put_loading, put_markdown, toast,
                            use_scope)
from pywebio.pin import pin, put_input

from utils.human_radable_td import human_readable_td
from utils.html_helper import link_HTML

NAME: str = "文章发布时间查询工具"
DESC: str = "本工具可查询文章的发布与更新时间。"


def on_query_button_clicked() -> None:
    url: str = pin.url

    if not url:
        toast("请输入简书文章 URL", color="warn")
        return

    try:
        article = Article.from_url(url)
    except InputError:
        toast("输入的不是简书文章 URL，请检查", color="error")
        return
    except ResourceError:
        toast("文章已被删除、锁定或正在审核中，无法获取数据", color="error")
        return

    with put_loading(color="success"):
        title = article.title
        publish_time = article.publish_time.replace(tzinfo=None)
        update_time = article.update_time
        is_updated = "是" if publish_time != update_time else "否"
        publish_td = datetime.now() - publish_time.replace(tzinfo=None)
        update_td = datetime.now() - update_time.replace(tzinfo=None)

        data: str = f"""
            文章标题：{title}
            链接：{link_HTML(url, url)}
            更新过：{is_updated}
            发布时间：{publish_time}（{human_readable_td(publish_td, accurate=False)}前）
            最后一次更新时间：{update_time}（{human_readable_td(update_td, accurate=False)}前）
        """

    with use_scope("result", clear=True):
        toast("数据获取成功", color="success")
        put_markdown(data)


def article_publish_time_viewer() -> None:
    put_input("url", type="text", label="文章 URL")
    put_button("查询", color="success", onclick=on_query_button_clicked)
