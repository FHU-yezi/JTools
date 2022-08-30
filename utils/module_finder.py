from os import listdir
from typing import Any, Callable, Dict, List, Optional


def get_module_path_list(path: str) -> List[str]:
    folders: List[str] = listdir(path)
    result: List[str] = []

    for folder in folders:
        files: List[str] = [
            f"{path}/{folder}/{file}"
            for file in listdir(f"{path}/{folder}")
            if file.endswith(".py")
        ]
        result.extend(files)

    return result


def get_import_path(path: str) -> str:
    return ".".join(path.split(".")[1].split("/")[1:])


def get_fromlist(path) -> List[str]:
    return get_import_path(path).split(".")[:-1]


def get_main_func_name(path: str) -> str:
    return path.split("/")[-1].split(".")[0]  # 模块名与主函数名相同


def get_module_obj(path: str):
    return __import__(get_import_path(path), fromlist=get_fromlist(path))


def get_main_func(module_obj, path: str) -> Callable:
    return getattr(module_obj, get_main_func_name(path))


def get_page_name(module_obj) -> str:
    return getattr(module_obj, "NAME")


def get_page_desc(module_obj) -> str:
    return getattr(module_obj, "DESC")
