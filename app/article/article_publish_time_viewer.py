from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article
from pywebio.output import put_markdown, toast
from pywebio.pin import pin, put_input
from sspeedup.pywebio.callbacks import on_enter_pressed
from sspeedup.pywebio.html import link
from sspeedup.pywebio.loading import green_loading
from sspeedup.pywebio.scope import use_clear_scope
from sspeedup.pywebio.toast import toast_error_and_return, toast_warn_and_return
from sspeedup.time_helper import human_readable_td_to_now, is_datetime_equal

from utils.text_filter import input_filter
from widgets.button import put_button

NAME: str = "文章发布时间查询工具"
DESC: str = "查询文章的发布与更新时间。"


def on_query_button_clicked() -> None:
    url: str = input_filter(pin.url)  # type: ignore

    if not url:
        toast_warn_and_return("请输入简书文章 URL")

    try:
        article = Article.from_url(url)
    except InputError:
        toast_error_and_return("输入的不是简书文章 URL，请检查")
    except ResourceError:
        toast_error_and_return("文章已被删除、锁定或正在审核中，无法获取数据")

    with green_loading():
        title = article.title
        publish_time = article.publish_time
        update_time = article.update_time
        is_updated = is_datetime_equal(publish_time, update_time)

        data: str = f"""
        文章标题：{title}
        链接：{link(url, url, new_window=True)}
        """

        if is_updated:
            data += f"""
        文章被更新过。
        发布时间：{publish_time}（{human_readable_td_to_now(publish_time)}前）
        最后一次更新时间：{update_time}（{human_readable_td_to_now(update_time)}前）
        """
        else:
            data += f"""
        文章没有被更新过。
        发布时间：{publish_time}（{human_readable_td_to_now(publish_time)}前）
        """

    with use_clear_scope("result"):
        toast("数据获取成功", color="success")
        put_markdown(data, sanitize=False)


def article_publish_time_viewer() -> None:
    put_input(
        "url",
        type="text",
        label="文章 URL",
    )
    put_button(
        "查询",
        color="success",
        onclick=on_query_button_clicked,
        block=True,
    )
    on_enter_pressed(
        "url",
        func=on_query_button_clicked,
    )
