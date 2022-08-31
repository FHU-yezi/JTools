from os import path as os_path
from typing import Any, Dict

from yaml import SafeLoader
from yaml import dump as yaml_dump
from yaml import load as yaml_load

_DEFAULT_CONFIG = {
    "version": "v0.1.0",
    "deploy": {
        "cdn": "",
        "port": 8080
    },
    "base_path": "./app",
    "footer": "",
    "db": {
        "host": "localhost",
        "port": 27017,
        "main_database": "JMFData"
    },
    "log": {
        "minimum_record_level": "DEBUG",
        "minimum_print_level": "INFO"
    },
    "status": {
        "out_of_service": [],
        "downgrade": []
    }
}


class Config():
    def __new__(cls) -> "Config":
        # 单例模式
        if not hasattr(cls, "_instance"):
            cls._instance = object.__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        if not os_path.exists("config.yaml"):  # 没有配置文件
            with open("config.yaml", "w", encoding="utf-8") as f:
                yaml_dump(_DEFAULT_CONFIG, f, allow_unicode=True, indent=4)
            self._data = _DEFAULT_CONFIG
        else:  # 有配置文件
            with open("config.yaml", "r", encoding="utf-8") as f:
                self._data = yaml_load(f, Loader=SafeLoader)

    def __getattr__(self, name: str) -> Any:
        self.refresh()

        result: Any = self._data[name]
        if isinstance(result, dict):
            return ConfigNode(result)
        else:
            return result

    def refresh(self):
        self.__init__()


class ConfigNode():
    def __init__(self, data: Dict[str, Any]) -> None:
        self._data: Dict[str, Any] = data

    def __getattr__(self, name: str) -> Any:
        return self._data[name]


def InitConfig() -> Config:
    return Config()  # 初始化日志文件


config = InitConfig()
