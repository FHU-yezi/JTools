from functools import lru_cache, wraps
from time import time
from typing import Any, Callable


def timeout_cache(seconds: int) -> Callable:
    def outer(func: Callable) -> Any:
        func = lru_cache()(func)  # 为函数添加 lru_cache 装饰器
        func.lifetime = seconds  # type: ignore
        func.expire_time = time() + func.lifetime  # type: ignore

        @wraps(func)
        def inner(*args: Any, **kwargs: Any) -> Any:
            if time() >= func.expire_time:  # type: ignore  # 已过期
                func.cache_clear()  # 清除缓存
                func.expire_time = time() + func.lifetime  # type: ignore  # 重新设置过期时间

            return func(*args, **kwargs)

        return inner

    return outer
