from dataclasses import dataclass
from os import listdir
from typing import Callable, Dict, List
from importlib import import_module


@dataclass()
class Module:
    module_type: str
    page_func_name: str
    page_func: Callable[[], None]
    page_name: str
    page_desc: str


def get_all_types(base_path: str) -> List[str]:
    return listdir(base_path)


def get_all_modules(base_path: str, types: List[str]) -> Dict[str, List[str]]:
    result: Dict[str, List[str]] = {}
    for type_ in types:
        result[type_] = [
            x.split(".")[0]
            for x in listdir(f"{base_path}/{type_}")
            if x.endswith(".py")
        ]
    return result


def get_module_info(base_path: str, type_: str, module_name: str) -> Module:
    module_obj = import_module(f"{base_path.split('/')[-1]}.{type_}.{module_name}")
    page_func: Callable[[], None] = getattr(module_obj, module_name)  # 页面函数名与模块名相同
    page_name: str = getattr(module_obj, "NAME")
    page_desc: str = getattr(module_obj, "DESC")

    return Module(
        module_type=type_,
        page_func_name=module_name,
        page_func=page_func,
        page_name=page_name,
        page_desc=page_desc
    )


def get_all_modules_info(base_path: str) -> List[Module]:
    result: List[Module] = []

    types: List[str] = get_all_types(base_path)
    module_names: Dict[str, List[str]] = get_all_modules(base_path, types)
    for type_, module_names_part in module_names.items():
        for module_name in module_names_part:
            result.append(get_module_info(base_path, type_, module_name))

    return result
