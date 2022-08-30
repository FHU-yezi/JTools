from collections import namedtuple
from os import listdir
from typing import Callable, Dict, List, NamedTuple

MODULE: NamedTuple = namedtuple("MODULE", ["full_path", "module_name", "module_type", "module_obj",
                                           "page_func_name", "page_func", "page_name", "page_desc"])


def get_import_path(full_path: str) -> str:
    return ".".join(full_path.split(".")[1].split("/")[1:])


def get_fromlist(full_path: str) -> List[str]:
    return get_import_path(full_path).split(".")[:-1]


def get_module_obj(full_path: str):
    return __import__(get_import_path(full_path), fromlist=get_fromlist(full_path))


def get_page_func(module_obj, page_func_name: str) -> Callable[[], None]:
    return getattr(module_obj, page_func_name)


def get_page_name(module_obj) -> str:
    return getattr(module_obj, "NAME")


def get_page_desc(module_obj) -> str:
    return getattr(module_obj, "DESC")


def get_module_info(base_path: str) -> Dict[str, List[MODULE]]:
    folders: List[str] = listdir(base_path)
    result: Dict[str, List[MODULE]] = {x: [] for x in folders}

    for folder in folders:
        modules: List[str] = [
            x
            for x in listdir(f"{base_path}/{folder}")
            if x.endswith(".py")
        ]

        for module in modules:
            full_path: str = f"{base_path}/{folder}/{module}"
            module_name: str = module.split(".")[0]
            module_type: str = full_path.split("/")[-2]
            module_obj = get_module_obj(full_path)

            page_func_name: str = module_name  # 模块名与页面函数名相同
            page_func: Callable[[], None] = get_page_func(module_obj, page_func_name)
            page_name: str = get_page_name(module_obj)
            page_desc: str = get_page_desc(module_obj)

            result[folder].append(MODULE(
                full_path=full_path,
                module_name=module_name,
                module_type=module_type,
                module_obj=module_obj,
                page_func_name=page_func_name,
                page_func=page_func,
                page_name=page_name,
                page_desc=page_desc
            ))

    return result
