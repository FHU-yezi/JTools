from sshared.postgres import Pool, enhance_json_process

from utils.config import CONFIG

enhance_json_process()

jtools_pool = Pool(
    CONFIG.jtools_postgres.connection_string, min_size=1, max_size=4, app_name="JTools"
)
jianshu_pool = Pool(
    CONFIG.jianshu_postgres.connection_string, min_size=2, max_size=8, app_name="JTools"
)
jpep_pool = Pool(
    CONFIG.jpep_postgres.connection_string, min_size=2, max_size=8, app_name="JTools"
)
