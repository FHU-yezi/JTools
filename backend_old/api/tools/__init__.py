from sanic import Blueprint

from api.tools.lottery_analyzer import lottery_analyzer_blueprint
from api.tools.LP_recommend_checker import LP_recommend_checker_blueprint

tools_blueprint = Blueprint.group(
    lottery_analyzer_blueprint,
    LP_recommend_checker_blueprint,
    url_prefix="/tools",
)
