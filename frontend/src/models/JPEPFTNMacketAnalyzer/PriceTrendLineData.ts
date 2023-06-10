export type TimeRange = "24h" | "7d" | "15d" | "30d"

export interface PriceTrendLineDataRequest {
    time_range: TimeRange;
}

export type PriceTrendLineDataItem = { [time: string]: number };

export interface PriceTrendLineDataResponse {
    buy_trend: PriceTrendLineDataItem;
    sell_trend: PriceTrendLineDataItem;
}
