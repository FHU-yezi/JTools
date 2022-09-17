from datetime import datetime, timedelta
from functools import wraps
from typing import Any, Callable, Dict, Tuple

_cached_result: Dict[str, Tuple[Any, datetime]] = {}


def timeout_cache(seconds: int) -> Callable:
    def outer(func: Callable):
        @wraps(func)
        def inner():
            func_name: str = func.__name__
            # 如果在缓存中找到了这个函数
            if func_name in _cached_result.keys():
                result, create_time = _cached_result[func_name]
                # 如果缓存没有过期，返回缓存后的结果
                if create_time + timedelta(seconds=seconds) >= datetime.now():
                    return result
                else:
                    # 删除已过期的缓存
                    del _cached_result[func_name]

            # 执行函数
            result = func()
            # 将结果存入缓存
            _cached_result[func_name] = (result, datetime.now())
            # 返回结果
            return result

        return inner
    return outer
