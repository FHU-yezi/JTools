from sanic import Blueprint

from api.info import info_blueprint
from api.tools import tools_blueprint

api_blueprint = Blueprint.group(
    info_blueprint,
    tools_blueprint,
    url_prefix="/api",
)
