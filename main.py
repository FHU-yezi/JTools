from typing import Callable, List

from pywebio import start_server

from utils.module_finder import get_module_info, MODULE
from utils.monkey_patch import (patch_add_footer, patch_add_html_name_desc,
                                patch_add_page_name_desc)
from pywebio.output import put_markdown
from utils.page_helper import get_current_page_url
from yaml import load as yaml_load, SafeLoader
from typing import Dict
from utils.html_helper import link_HTML

STRUCTURE_MAPPING: Dict[str, str] = yaml_load(
    open("./structure.yaml", "r", encoding="utf-8"),
    Loader=SafeLoader
)

MODULE_INFO: Dict[str, List[MODULE]] = get_module_info("./app")  # TODO: 写入配置文件

modules_list: List[MODULE] = []
for package in MODULE_INFO.values():
    modules_list.extend(package)


def get_all_funcs(modules_list: List[MODULE]) -> List[Callable[[], None]]:
    func_list: List[Callable[[], None]] = []
    for module in modules_list:
        page_func: Callable[[], None] = module.page_func
        page_name: str = module.page_name
        page_desc: str = module.page_desc

        page_func = patch_add_html_name_desc(page_func, page_name, page_desc)
        page_func = patch_add_page_name_desc(page_func, page_name, page_desc)
        page_func = patch_add_footer(page_func, "Powerded By JRT and PyWebIO")  # TODO: 写入配置文件

        func_list.append(page_func)

    return func_list


func_list: List[Callable[[], None]] = get_all_funcs(modules_list)


def index() -> None:
    """简书小工具集

    为简友提供高效便捷的科技工具。
    """
    put_markdown("""
    # 简书小工具集

    为简友提供高效便捷的科技工具。
    """)

    current_page_url: str = get_current_page_url()

    for type_, type_name in STRUCTURE_MAPPING.items():
        module_part: List[MODULE] = [x for x in modules_list if x.module_type == type_]
        content: str = f"**{type_name}**\n"

        for module in module_part:
            content += f"- {module.page_name}>>[点击跳转]({f'{current_page_url}/?app={module.module_name}'})\n"

        put_markdown(content)


func_list.append(index)  # 将主页函数加入函数列表

start_server(func_list, host="0.0.0.0", port=8080,
             cdn="https://ss-assets-cdn.oss-cn-hangzhou.aliyuncs.com/pywebio/v1.6.2/")
