from sanic import Blueprint

from api.tools.JPEP_FTN_macket_analyzer import JPEP_FTN_market_analyzer_blueprint
from api.tools.lottery_analyzer import lottery_analyzer_blueprint
from api.tools.LP_recommend_checker import LP_recommend_checker_blueprint

tools_blueprint = Blueprint.group(
    JPEP_FTN_market_analyzer_blueprint,
    lottery_analyzer_blueprint,
    LP_recommend_checker_blueprint,
    url_prefix="/tools",
)
