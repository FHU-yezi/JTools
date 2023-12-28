from enum import Enum
from typing import Any, Dict, Literal, Optional

from msgspec import Struct
from msgspec.yaml import decode

_TOOLS_CONFIG_STRUCT_CONFIG: Dict[str, Any] = {
    "frozen": True,
    "kw_only": True,
    "forbid_unknown_fields": True,
}


class ToolStatus(Enum):
    NORMAL = "NORMAL"
    UNAVAILABLE = "UNAVAILABLE"
    DOWNGRADED = "DOWNGRADED"


class _DataUpdateTimeItem(Struct, **_TOOLS_CONFIG_STRUCT_CONFIG):
    collection: str
    sort_key: str
    sort_direction: Literal["asc", "desc"]


class _DataCountItem(Struct, **_TOOLS_CONFIG_STRUCT_CONFIG):
    collection: str
    mode: Literal["accurate", "estimated"]


class _ToolConfig(Struct, **_TOOLS_CONFIG_STRUCT_CONFIG):
    status: ToolStatus
    reason: Optional[str]
    last_update_time: Optional[_DataUpdateTimeItem]
    data_update_freq: Optional[str]
    data_count: Optional[_DataCountItem]
    data_source: Optional[Dict[str, str]]


with open("tools_config.yaml", "rb") as f:
    TOOLS_CONFIG = decode(f.read(), type=Dict[str, _ToolConfig])
