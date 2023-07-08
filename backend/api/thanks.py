from typing import Dict, List

from sanic import Blueprint, HTTPResponse, Request
from sspeedup.api import CODE, sanic_response_json
from yaml import safe_load

from utils.pydantic_base import BaseModel


class DebugProjectRecordsItem(BaseModel):
    time: str
    type: str  # noqa: A003
    module: str
    desc: str
    user_name: str
    user_url: str
    award: int


class ThanksData(BaseModel):
    v3_beta_paticipants: Dict[str, str]
    opensource_packages: Dict[str, str]
    debug_project_records: List[DebugProjectRecordsItem]


with open("thanks.yaml", encoding="utf-8") as file:
    THANKS_DATA = ThanksData(**safe_load(file))

thanks_blueprint = Blueprint("thanks", url_prefix="/thanks")


class ThanksResponse(BaseModel):
    v3_beta_paticipants: Dict[str, str]
    opensource_packages: Dict[str, str]
    debug_project_records: List[DebugProjectRecordsItem]


@thanks_blueprint.get("/")
def thanks_handler(request: Request) -> HTTPResponse:
    del request

    return sanic_response_json(
        code=CODE.SUCCESS,
        data=ThanksResponse(
            v3_beta_paticipants=THANKS_DATA.v3_beta_paticipants,
            opensource_packages=THANKS_DATA.opensource_packages,
            debug_project_records=THANKS_DATA.debug_project_records,
        ).model_dump(),
    )
