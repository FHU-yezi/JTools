from pydantic import BaseModel as _BaseModel


class BaseModel(_BaseModel):
    class Config:
        extra = "forbid"
        max_anystr_length = 30000
        allow_mutation = False
        allow_inf_nan = False
