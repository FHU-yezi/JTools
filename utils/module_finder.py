from os import listdir
from typing import Any, Dict, List, Optional


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


def get_module_name(path: str) -> str:
    return path.split("/")[-1].split(".")[0]


def get_func_name(path: str) -> str:
    return get_module_name(path)  # 模块名与主函数名相同
