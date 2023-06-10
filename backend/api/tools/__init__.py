from sanic import Blueprint

from api.tools.article_publish_time_viewer import article_publish_time_viewer_blueprint
from api.tools.article_wordcloud_generator import article_wordcloud_generator_blueprint
from api.tools.lottery_analyzer import lottery_analyzer_blueprint
from api.tools.lottery_reward_record_viewer import (
    lottery_reward_record_viewer_blueprint,
)
from api.tools.LP_recommend_checker import LP_recommend_checker_blueprint
from api.tools.on_rank_article_viewer import on_rank_article_viewer_blueprint
from api.tools.VIP_info_viewer import VIP_info_viewer_blueprint

tools_blueprint = Blueprint.group(
    article_publish_time_viewer_blueprint,
    article_wordcloud_generator_blueprint,
    lottery_analyzer_blueprint,
    lottery_reward_record_viewer_blueprint,
    LP_recommend_checker_blueprint,
    on_rank_article_viewer_blueprint,
    VIP_info_viewer_blueprint,
    url_prefix="/tools",
)
