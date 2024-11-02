from sshared.config import ConfigBase
from sshared.config.blocks import (
    AliyunAccessKeyBlock,
    LoggingBlock,
    MongoBlock,
    PostgresBlock,
    UvicornBlock,
)


class _Config(ConfigBase, frozen=True):
    mongo: MongoBlock
    jtools_postgres: PostgresBlock
    jianshu_postgres: PostgresBlock
    jpep_postgres: PostgresBlock
    logging: LoggingBlock
    uvicorn: UvicornBlock
    word_split_access_key: AliyunAccessKeyBlock


CONFIG = _Config.load_from_file("config.toml")
