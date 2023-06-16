from typing import Dict


def filter_null_value(item: Dict) -> Dict:
    return {k: v for k, v in item.items() if v is not None}
