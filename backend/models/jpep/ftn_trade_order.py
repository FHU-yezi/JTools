from datetime import datetime
from typing import Literal

from jkit.msgspec_constraints import (
    NonNegativeInt,
    PositiveFloat,
    PositiveInt,
)
from sshared.mongo import Document, Field, Index

from utils.db import JPEP_DB


class AmountField(Field, frozen=True):
    total: PositiveInt
    traded: NonNegativeInt
    tradable: NonNegativeInt
    minimum_trade: PositiveInt


class FTNTradeOrderDocument(Document, frozen=True):
    fetch_time: datetime
    id: PositiveInt
    published_at: datetime
    type: Literal["buy", "sell"]
    price: PositiveFloat
    traded_count: NonNegativeInt

    amount: AmountField
    publisher_id: PositiveInt

    class Meta:  # type: ignore
        collection = JPEP_DB.ftn_trade_orders
        indexes = (Index(keys=("fetchTime", "id"), unique=True).validate(),)
