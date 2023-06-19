from sanic import Blueprint

from api.info import info_blueprint
from api.status import status_blueprint
from api.thanks import thanks_blueprint
from api.tools import tools_blueprint

api_blueprint = Blueprint.group(
    info_blueprint,
    status_blueprint,
    thanks_blueprint,
    tools_blueprint,
    url_prefix="/api",
)
