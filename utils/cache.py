from functools import lru_cache, wraps
from time import time
from typing import Callable


def timeout_cache(seconds: int) -> Callable:
    def outer(func):
        func = lru_cache()(func)  # 为函数添加 lru_cache 装饰器
        func.lifetime = seconds
        func.expire_time = time() + func.lifetime

        @wraps(func)
        def inner(*args, **kwargs):
            if time() >= func.expire_time:  # 已过期
                func.cache_clear()  # 清除缓存
                func.expire_time = time() + func.lifetime  # 重新设置过期时间

            return func(*args, **kwargs)

        return inner
    return outer
