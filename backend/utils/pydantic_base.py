from pydantic import BaseModel as _BaseModel
from pydantic import ConfigDict


class BaseModel(_BaseModel):
    model_config = ConfigDict(
        str_max_length=50000,
        strict=True,
        extra="forbid",
        frozen=True,
        allow_inf_nan=False,
    )
