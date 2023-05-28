from sanic import Blueprint

from api.tools import tools_blueprint

api_blueprint = Blueprint.group(tools_blueprint, url_prefix="/api")
