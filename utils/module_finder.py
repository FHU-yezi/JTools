from os import listdir
from typing import Any, Callable, Dict, List, Optional


def get_modules_path(path: str) -> Dict[str, Optional[str]]:
    folders: List[str] = listdir(path)
    result: Dict[str, Optional[Any]] = dict.fromkeys(folders)

    for folder in folders:
        files: List[str] = [
            f"{path}/{folder}/{file}"
            for file in listdir(f"{path}/{folder}")
            if file.endswith(".py")
        ]
        result[folder] = files

    return result


def get_import_path(path: str) -> str:
    return ".".join(path.split(".")[1].split("/")[1:])


def get_fromlist(path) -> List[str]:
    return get_import_path(path).split(".")[:-1]


def get_main_func_name(path: str) -> str:
    return path.split("/")[-1].split(".")[0]  # 模块名与主函数名相同


def get_module_obj(path: str):
    return __import__(get_import_path(path), fromlist=get_fromlist(path))


def get_main_func(module, path: str) -> Callable:
    return getattr(module, get_main_func_name(path))


def get_page_name(module) -> str:
    return getattr(module, "NAME")


def get_page_desc(module) -> str:
    return getattr(module, "DESC")
