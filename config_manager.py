from os import path as os_path

from yaml import SafeLoader
from yaml import dump as yaml_dump
from yaml import load as yaml_load

_DEFAULT_CONFIG = {
    "version": "0.0.0",
    "port": "8080",
    "mainpage_footer": "",
    "service_pages_footer": "",
    "global_notification": None,
    "services": [
        {
            "name": "未命名模块",
            "description": "模块描述",
            "service_func_name": "UnnamedService",
            "status": 0,
            "notification": None,
            "on_top": False
        }
    ]
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
            self._config_dict = _DEFAULT_CONFIG
        else:  # 有配置文件
            with open("config.yaml", "r", encoding="utf-8") as f:
                self._config_dict = yaml_load(f, Loader=SafeLoader)

    def __getitem__(self, item):
        self.refresh()  # 刷新配置文件以应用更改
        item_path = item.split("/")
        result = self._config_dict
        for now_path in item_path:
            result = result[now_path]
        return result

    def refresh(self):
        self.__init__()


def InitConfig() -> Config:
    return Config()  # 初始化日志文件


config = InitConfig()
