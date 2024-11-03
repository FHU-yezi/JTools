from sshared.postgres import ConnectionManager, enhance_json_process

from utils.config import CONFIG

enhance_json_process()


_jtools_connection_manager = ConnectionManager(CONFIG.jtools_postgres.connection_string)
_jianshu_connection_manager = ConnectionManager(
    CONFIG.jianshu_postgres.connection_string
)
_jpep_connection_manager = ConnectionManager(CONFIG.jpep_postgres.connection_string)

get_jtools_conn = _jtools_connection_manager.get_conn
get_jianshu_conn = _jianshu_connection_manager.get_conn
get_jpep_conn = _jpep_connection_manager.get_conn
