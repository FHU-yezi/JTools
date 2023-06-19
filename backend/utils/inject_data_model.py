from functools import wraps
from typing import Any, Callable

from pydantic import BaseModel, ValidationError
from sanic import BadRequest, HTTPResponse, Request
from sspeedup.api import CODE, sanic_response_json


def inject_data_model_from_body(model: Any) -> Callable:
    def outer(
        func: Callable[[Request, BaseModel], HTTPResponse]
    ) -> Callable[[Request], HTTPResponse]:
        @wraps(func)
        def inner(request: Request) -> HTTPResponse:
            try:
                data = model.parse_obj(request.json)
            except BadRequest:
                return sanic_response_json(code=CODE.UNKNOWN_DATA_FORMAT)
            except ValidationError as e:
                return sanic_response_json(code=CODE.BAD_ARGUMENTS, message=str(e))
            else:
                return func(request, data)

        return inner

    return outer

def inject_data_model_from_query_args(model: Any) -> Callable:
    def outer(
        func: Callable[[Request, BaseModel], HTTPResponse]
    ) -> Callable[[Request], HTTPResponse]:
        @wraps(func)
        def inner(request: Request) -> HTTPResponse:
            try:
                data = model.parse_obj(request.query_args)
            except BadRequest:
                return sanic_response_json(code=CODE.UNKNOWN_DATA_FORMAT)
            except ValidationError as e:
                return sanic_response_json(code=CODE.BAD_ARGUMENTS, message=str(e))
            else:
                return func(request, data)

        return inner

    return outer
