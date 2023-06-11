from datetime import datetime  # noqa: N999
from typing import Optional

from JianshuResearchTools.exceptions import InputError, ResourceError  # noqa: N999
from JianshuResearchTools.objects import User, set_cache_status
from sanic import Blueprint, HTTPResponse, Request
from sspeedup.api import CODE, sanic_response_json
from sspeedup.time_helper import human_readable_td

from utils.inject_data_model import inject_data_model_from_body
from utils.pydantic_base import BaseModel

set_cache_status(False)

VIP_info_viewer_blueprint = Blueprint("VIP_info_viewer", url_prefix="/VIP_info_viewer")


class VIPInfoRequest(BaseModel):
    user_url: str


class VIPInfoResponse(BaseModel):
    name: str
    VIP_type: str
    VIP_expire_time: Optional[int]
    VIP_expire_time_to_now_human_readable: Optional[str]


@VIP_info_viewer_blueprint.post("/VIP_info")
@inject_data_model_from_body(VIPInfoRequest)
def VIP_info_handler(  # noqa: N802
    request: Request, data: VIPInfoRequest
) -> HTTPResponse:
    del request

    try:
        user = User.from_url(data.user_url)
    except InputError:
        return sanic_response_json(code=CODE.BAD_ARGUMENTS, message="输入的简书个人主页链接无效")
    except ResourceError:
        return sanic_response_json(code=CODE.BAD_ARGUMENTS, message="用户已注销或被封禁")

    name = user.name
    VIP_info = user.VIP_info  # noqa: N806
    VIP_type: str = VIP_info["vip_type"]  # noqa: N806
    if not VIP_type:
        VIP_type = "无会员"  # noqa: N806
    VIP_expire_time: datetime = VIP_info["expire_date"]  # noqa: N806
    if VIP_expire_time:
        VIP_expire_time = VIP_expire_time.replace(hour=0, minute=0, second=0)  # noqa: N806
        VIP_expire_time_to_now_human_readable = human_readable_td(  # noqa: N806
            VIP_expire_time - datetime.now()
        )
    else:
        VIP_expire_time_to_now_human_readable = None  # noqa: N806

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=VIPInfoResponse(
            name=name,
            VIP_type=VIP_type,
            VIP_expire_time=int(VIP_expire_time.timestamp()) if VIP_expire_time else None,
            VIP_expire_time_to_now_human_readable=VIP_expire_time_to_now_human_readable,
        ).dict(),
    )
