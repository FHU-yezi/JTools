from signal import SIGTERM, signal
from typing import Callable, Dict, List

from JianshuResearchTools.objects import set_cache_status
from pywebio import start_server
from pywebio.output import put_markdown
from yaml import SafeLoader
from yaml import load as yaml_load

from utils.config import config
from utils.html import link
from utils.log import access_logger, run_logger
from utils.module_finder import Module, get_all_modules_info
from utils.page import get_base_url
from utils.patch import patch_all
from widgets.card import put_app_card

set_cache_status(False)  # 禁用 JRT 缓存功能

# 注册信号事件回调
# 在收到 SIGTERM 时执行日志强制刷新，之后退出
signal(SIGTERM, lambda _, __: run_logger.force_refresh())
signal(SIGTERM, lambda _, __: access_logger.force_refresh())
run_logger.debug("已注册事件回调")

STRUCTURE_MAPPING: Dict[str, str] = yaml_load(
    open("./structure.yaml", "r", encoding="utf-8"), Loader=SafeLoader
)
modules_list = get_all_modules_info(config.base_path)


def get_status_color(module_name: str) -> str:
    status = config.status

    if module_name in status.out_of_service:
        return "#FF2D10"  # 红色
    elif module_name in status.downgrade:
        return "#FF8C00"  # 橙色
    else:
        return "#008700"  # 绿色


def get_status_text(module_name: str) -> str:
    status = config.status

    if module_name in status.out_of_service:
        return "暂停服务"
    elif module_name in status.downgrade:
        return "降级"
    else:
        return "正常"


def get_jump_link(base_url: str, module_name: str) -> str:
    return f"{base_url}/?app={module_name}"


def index() -> None:
    put_markdown(
        f"""
        版本：{config.version}
        本项目在 GitHub 上开源：{link("https://github.com/FHU-yezi/JianshuMicroFeatures",
        "https://github.com/FHU-yezi/JianshuMicroFeatures", new_window=True)}
        """
    )

    config.refresh()  # 刷新配置文件

    for type_, type_name in STRUCTURE_MAPPING.items():
        module_part: List[Module] = [x for x in modules_list if x.module_type == type_]
        put_markdown(f"## {type_name}\n")

        for module in module_part:
            put_app_card(
                name=module.page_name,
                status_color=get_status_color(module.page_name),
                status_text=get_status_text(module.page_name),
                url=get_jump_link(get_base_url(), module.page_func_name),
                desc=module.page_desc,
            )


# 将主页函数加入列表
modules_list.append(
    Module(
        module_type="",
        page_func_name="index",
        page_func=index,
        page_name="简书小工具集",
        page_desc="为简友提供高效便捷的科技工具。",
    )
)
patched_modules_list: List[Module] = [patch_all(module) for module in modules_list]
func_list: List[Callable[[], None]] = [x.page_func for x in patched_modules_list]

start_server(
    func_list,
    host="0.0.0.0",
    port=config.deploy.port,
    cdn=config.deploy.pywebio_cdn,
    debug=config.deploy.debug,
)
