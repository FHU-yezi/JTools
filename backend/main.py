from sanic import Sanic

from api import api_blueprint
from utils.config import config
from utils.log import run_logger

app = Sanic(__name__)
app.blueprint(api_blueprint)

if __name__ == "__main__":
    run_logger.info("启动 API 服务...")
    app.run(host="0.0.0.0", port=config.deploy.port, single_process=True)
