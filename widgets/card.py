from datetime import datetime, date

from JianshuResearchTools.convert import (
    ArticleUrlToArticleUrlScheme,
    UserUrlToUserUrlScheme,
)
from pywebio.output import Output, put_widget

from utils.time_helper import human_readable_td_to_now


def put_app_card(
    name: str, status_color: str, status_text: str, url: str, desc: str
) -> Output:
    tpl: str = """
    <div class="card" style="padding: 20px; padding-bottom: 10px; margin-bottom: 20px; border-radius: 20px;">
        <b style="font-size: 20px; padding-bottom: 15px;">{{name}}</b>
        <p>状态：<font color="{{status_color}}">{{status_text}}</font></p>
        <p>{{desc}}</p>
        <button class="btn btn-outline-secondary" style="position: absolute; top: 16px; right: 30px;" onclick="window.open('{{url}}', '_blank')" {{disabled}}><b>&gt;</b></button>
    </div>
    """
    return put_widget(
        tpl,
        {
            "name": name,
            "status_color": status_color,
            "status_text": status_text,
            "desc": desc,
            "url": url if status_text != "暂停服务" else "",
            "disabled": "disabled" if status_text == "暂停服务" else "",
        },
    )


def put_article_detail_card(
    source_collection: str,
    article_title: str,
    article_URL: str,
    release_time: datetime,
    views_count: int,
    likes_count: int,
    comments_count: int,
    total_FP_count: float,
    summary: str,
    author_name: str,
    author_URL: str,
    enable_URL_scheme: bool,
    can_use_URL_Scheme: bool,
) -> Output:
    tpl: str = """
    <div class="card" style="padding: 20px; padding-bottom: 10px; margin-bottom: 20px; border-radius: 20px;">
        <p>来源专题：{{source_collection}}</p>
        <p>文章标题：{{article_title}}（<a href="{{article_URL}}" target="_blank" rel="noopener noreferer">点击跳转</a>）</p>
        <p>作者名：{{author_name}}（<a href="{{author_URL}}" target="_blank" rel="noopener noreferer">点击跳转</a>）</p>
        <p>发布时间：{{release_time}}（{{human_readable_release_time}}）</p>
        <p>阅 / 赞 / 评：{{views_count}} / {{likes_count}} / {{comments_count}}</p>
        <p>获钻量：{{total_FP_count}}</p>
        <p>内容摘要：</p>
        <p>{{summary}}</p>
    </div>
    """
    return put_widget(
        tpl,
        {
            "source_collection": source_collection,
            "article_title": article_title,
            "article_URL": (
                ArticleUrlToArticleUrlScheme(article_URL)
                if enable_URL_scheme and can_use_URL_Scheme
                else article_URL
            ),
            "release_time": release_time.strftime(r"%Y-%m-%d %X"),
            "human_readable_release_time": human_readable_td_to_now(release_time),
            "views_count": views_count,
            "likes_count": likes_count,
            "comments_count": comments_count,
            "total_FP_count": total_FP_count,
            "summary": summary,
            "author_name": author_name,
            "author_URL": (
                UserUrlToUserUrlScheme(author_URL)
                if enable_URL_scheme and can_use_URL_Scheme
                else author_URL
            ),
        },
    )


def put_debug_project_record_card(
    time: date, type_: str, module: str, desc: str, user_name: str, user_url: str, award: int
) -> Output:
    tpl: str = """
    <div class="card", style="padding: 20px; padding-bottom: 10px; margin-bottom: 20px; border-radius: 20px;">
        <p style="margin: 3px; font-size: 18px;"><b>{{time}} | {{type}}</b></p>
        <p style="font-size: 14px; color: #57606A">{{module}}</p>
        <p>描述：{{desc}}</p>
        <p>反馈者：<a href="{{user_url}}" target="_blank" rel="noopener noreferrer">{{user_name}}</a></p>
        <p>奖励：{{award}} 简书贝</p>
    </div>
    """
    return put_widget(
        tpl,
        {
            "time": str(time),
            "type": type_,
            "module": module,
            "desc": desc,
            "user_name": user_name,
            "user_url": user_url,
            "award": award,
        },
    )