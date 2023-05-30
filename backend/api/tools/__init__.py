from sanic import Blueprint

from api.tools.article_publish_time_viewer import article_publish_time_viewer_blueprint
from api.tools.lottery_reward_record_viewer import (
    lottery_reward_record_viewer_blueprint,
)

tools_blueprint = Blueprint.group(
    article_publish_time_viewer_blueprint,
    lottery_reward_record_viewer_blueprint,
    url_prefix="/tools",
)
