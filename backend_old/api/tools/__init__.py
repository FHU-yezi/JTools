from sanic import Blueprint

from api.tools.LP_recommend_checker import LP_recommend_checker_blueprint

tools_blueprint = Blueprint.group(
    LP_recommend_checker_blueprint,
    url_prefix="/tools",
)
