export type TimeRange = "24h" | "7d" | "15d" | "30d"

export interface PriceTrendDataRequest {
    time_range: TimeRange;
}

export type PriceTrendDataItem = { [time: string]: number };

export interface PriceTrendDataResponse {
    buy_trend: PriceTrendDataItem;
    sell_trend: PriceTrendDataItem;
}
