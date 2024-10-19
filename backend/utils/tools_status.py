from datetime import datetime
from typing import Optional

from sshared.mongo import Document

from models.jianshu.article_earning_ranking_record import (
    ArticleEarningRankingRecordDocument,
)
from models.jianshu.lottery_win_record import LotteryWinRecordDocument
from models.jpep.ftn_trade_order import FTNTradeOrderDocument

COLLECTION_NAME_TO_OBJ: dict[str, type[Document]] = {
    "article_earning_ranking_records": ArticleEarningRankingRecordDocument,
    "lottery_win_records": LotteryWinRecordDocument,
    "FTN_trade_orders": FTNTradeOrderDocument,
}


async def get_last_update_time(
    collection: type[Document], order_by: str, target_field: str
) -> Optional[datetime]:
    latest_record = await collection.find_one(sort={order_by: "DESC"})

    # 获取到的是数据记录对象，将其转换为字典
    # 然后通过驼峰样式的 sort_key 获取到数据更新时间
    return latest_record.to_dict()[target_field] if latest_record else None


async def get_data_count(collection: type[Document]) -> int:
    return await collection.count(fast=True)
