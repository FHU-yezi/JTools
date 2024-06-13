from msgspec import Struct
from sspeedup.config import load_or_save_default_config, set_reload_on_sighup
from sspeedup.config.blocks import (
    CONFIG_STRUCT_CONFIG,
    AbilityWordSplitConfig,
    DeployConfig,
    LoggingConfig,
    MongoDBConfig,
)


class _Config(Struct, **CONFIG_STRUCT_CONFIG):
    version: str = "v3.0.0"
    deploy: DeployConfig = DeployConfig()
    db: MongoDBConfig = MongoDBConfig()
    log: LoggingConfig = LoggingConfig()
    ability_word_split: AbilityWordSplitConfig = AbilityWordSplitConfig()


config = load_or_save_default_config(_Config)


def on_reload_success(new_config: _Config) -> None:
    from utils.log import logger

    global config
    config = new_config
    logger.info("配置文件已重载...")


def on_reload_failed(e: Exception) -> None:
    from utils.log import logger

    logger.error(f"配置文件重载失败：{e}", exc=e)


set_reload_on_sighup(
    _Config,
    success_callback=on_reload_success,
    failed_callback=on_reload_failed,
)
