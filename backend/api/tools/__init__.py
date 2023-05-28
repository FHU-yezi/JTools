from sanic import Blueprint

from api.tools.article_publish_time_viewer import article_publish_time_viewer_blueprint

tools_blueprint = Blueprint.group(
    article_publish_time_viewer_blueprint, url_prefix="/tools"
)
