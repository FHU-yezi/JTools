from sshared.postgres import ConnectionManager, enhance_json_process

from utils.config import CONFIG

enhance_json_process()


_jtools_connection_manager = ConnectionManager(CONFIG.postgres.connection_string)
_jianshu_connection_manager = ConnectionManager(
    CONFIG.postgres.connection_string.rsplit("/", maxsplit=1)[0] + "/jianshu"
)

get_jtools_conn = _jtools_connection_manager.get_conn
get_jianshu_conn = _jianshu_connection_manager.get_conn
