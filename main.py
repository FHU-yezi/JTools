from signal import SIGTERM, signal
from typing import Callable, Dict, List

from JianshuResearchTools.objects import set_cache_status
from pywebio import start_server
from pywebio.output import put_markdown
from yaml import SafeLoader
from yaml import load as yaml_load

from utils.config import config
from utils.html import (
    green_text,
    grey_text,
    link,
    orange_link,
    orange_text,
    red_text,
)
from utils.log import access_logger, run_logger
from utils.module_finder import Module, get_all_modules_info
from utils.page import get_base_url
from utils.patch import patch_all

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


def get_status_HTML(module_name: str) -> str:
    status = config.status

    if module_name in status.out_of_service:
        return red_text("【暂停服务】")
    elif module_name in status.downgrade:
        return orange_text("【降级】")
    else:
        return green_text("【正常】")


def get_jump_link(base_url: str, module_name: str) -> str:
    status = config.status

    if module_name in status.out_of_service:
        return grey_text("无法跳转")
    elif module_name in status.downgrade:
        return orange_link("点击跳转>>", f"{base_url}/?app={module_name}", new_window=True)
    else:
        return link("点击跳转>>", f"{base_url}/?app={module_name}", new_window=True)


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
        content: str = f"## {type_name}\n"

        for module in module_part:
            content += (
                f"**{get_status_HTML(module.page_name)}"
                f"{module.page_name}**   "
                f"{get_jump_link(get_base_url(), module.page_func_name)}\n\n"
                f"{module.page_desc}\n\n"
            )

        # 必须传入 sanitize=False 禁用 XSS 攻击防护
        # 否则 target="_blank" 属性会消失，无法实现新标签页打开
        put_markdown(content, sanitize=False)


# 将主页函数加入列表
modules_list.append(
    Module(
        module_type=None,
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
)
