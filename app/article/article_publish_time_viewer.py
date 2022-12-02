from JianshuResearchTools.exceptions import InputError, ResourceError
from JianshuResearchTools.objects import Article
from pywebio.output import put_button, put_markdown, toast
from pywebio.pin import pin, put_input

from utils.callback import bind_enter_key_callback
from utils.html import link
from utils.text_filter import input_filter
from utils.time_helper import human_readable_td_to_now, is_datetime_equal
from utils.widgets import (
    green_loading,
    toast_error_and_return,
    toast_warn_and_return,
    use_result_scope,
)

NAME: str = "文章发布时间查询工具"
DESC: str = "查询文章的发布与更新时间。"


def on_enter_key_pressed(_) -> None:
    on_query_button_clicked()


def on_query_button_clicked() -> None:
    url: str = input_filter(pin.url)

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
        publish_time = article.publish_time.replace(tzinfo=None)
        update_time = article.update_time
        is_updated = is_datetime_equal(publish_time, update_time)

        # TODO: 新窗口打开链接不生效
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

    with use_result_scope():
        toast("数据获取成功", color="success")
        put_markdown(data)


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
    )
    bind_enter_key_callback(
        "url",
        on_enter_key_pressed,
    )
