from typing import Callable, Dict, List

from pywebio import start_server
from pywebio.output import put_markdown
from yaml import SafeLoader
from yaml import load as yaml_load

from utils.config_manager import config
from utils.html_helper import (green_text_HTML, grey_text_HTML, link_HTML,
                               orange_link_HTML, orange_text_HTML,
                               red_text_HTML)
from utils.module_finder import MODULE, get_module_info
from utils.monkey_patch import (patch_add_footer, patch_add_html_name_desc,
                                patch_add_page_name_desc, patch_record_access)
from utils.page_helper import get_current_page_url
from JianshuResearchTools.objects import set_cache_status

set_cache_status(False)  # 禁用 JRT 缓存功能

STRUCTURE_MAPPING: Dict[str, str] = yaml_load(
    open("./structure.yaml", "r", encoding="utf-8"),
    Loader=SafeLoader
)

MODULE_INFO: Dict[str, List[MODULE]] = get_module_info(config.base_path)

modules_list: List[MODULE] = []
for package in MODULE_INFO.values():
    modules_list.extend(package)


def get_all_funcs(modules_list: List[MODULE]) -> List[Callable[[], None]]:
    func_list: List[Callable[[], None]] = []
    for module in modules_list:
        page_func: Callable[[], None] = module.page_func
        page_func_name: str = module.page_func_name
        page_name: str = module.page_name
        page_desc: str = module.page_desc

        page_func = patch_add_page_name_desc(page_func, page_name, page_desc)
        page_func = patch_add_footer(page_func, config.footer)
        page_func = patch_record_access(page_func, page_func_name)
        page_func = patch_add_html_name_desc(page_func, page_name, page_desc)

        func_list.append(page_func)

    return func_list


def get_status_HTML(module_name: str) -> str:
    status = config.status

    if module_name in status.out_of_service:
        return red_text_HTML("【暂停服务】")
    elif module_name in status.downgrade:
        return orange_text_HTML("【降级】")
    else:
        return green_text_HTML("【正常】")


def get_jump_link(base_url: str, module_name: str) -> str:
    status = config.status

    if module_name in status.out_of_service:
        return grey_text_HTML("无法跳转")
    elif module_name in status.downgrade:
        # TODO: 新窗口打开链接不生效
        return orange_link_HTML("点击跳转>>", f"{base_url}/?app={module_name}")
    else:
        return link_HTML("点击跳转>>", f"{base_url}/?app={module_name}")


def index() -> None:
    put_markdown(f"""
    版本：{config.version}
    本项目在 GitHub 上开源：https://github.com/FHU-yezi/JianshuMicroFeatures
    """)

    config.refresh()  # 刷新配置文件

    for type_, type_name in STRUCTURE_MAPPING.items():
        module_part: List[MODULE] = [x for x in modules_list
                                     if x.module_type == type_]
        content: str = f"## {type_name}\n"

        for module in module_part:
            content += (f"**{get_status_HTML(module.page_name)}"
                        f"{module.page_name}**   "
                        f"{get_jump_link(get_current_page_url(), module.page_func_name)}\n\n"
                        f"{module.page_desc}\n\n")

        put_markdown(content)


# 将主页函数加入列表
modules_list.append(MODULE(
    module_type=None,
    page_func_name="index",
    page_func=index,
    page_name="简书小工具集",
    page_desc="为简友提供高效便捷的科技工具。"
))
func_list: List[Callable[[], None]] = get_all_funcs(modules_list)

start_server(func_list, host="0.0.0.0", port=config.deploy.port, cdn=config.deploy.pywebio_cdn)
