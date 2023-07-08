from functools import wraps
from typing import Callable

from pydantic import BaseModel, ValidationError
from pydantic._internal._model_construction import ModelMetaclass
from sanic import BadRequest, HTTPResponse, Request
from sspeedup.api import CODE, sanic_response_json


def inject_data_model_from_body(model: ModelMetaclass) -> Callable:
    def outer(
        func: Callable[[Request, BaseModel], HTTPResponse]
    ) -> Callable[[Request], HTTPResponse]:
        @wraps(func)
        def inner(request: Request) -> HTTPResponse:
            try:
                data = model.model_validate_json(request.body)
            except BadRequest:
                return sanic_response_json(code=CODE.UNKNOWN_DATA_FORMAT)
            except ValidationError as e:
                return sanic_response_json(code=CODE.BAD_ARGUMENTS, message=str(e))
            else:
                return func(request, data)

        return inner

    return outer


def inject_data_model_from_query_args(model: ModelMetaclass) -> Callable:
    def outer(
        func: Callable[[Request, BaseModel], HTTPResponse]
    ) -> Callable[[Request], HTTPResponse]:
        @wraps(func)
        def inner(request: Request) -> HTTPResponse:
            try:
                # 在 Query Args 规范中，每个 key 可以有多个 value
                # 故 request.args 返回的是 Dict[str, List[Any]] 形式的数据
                # 此处仅保留每个 key 的第一个 value
                data = model.model_validate({k: v[0] for k, v in request.args.items()})
            except BadRequest:
                return sanic_response_json(code=CODE.UNKNOWN_DATA_FORMAT)
            except ValidationError as e:
                return sanic_response_json(code=CODE.BAD_ARGUMENTS, message=str(e))
            else:
                return func(request, data)

        return inner

    return outer
