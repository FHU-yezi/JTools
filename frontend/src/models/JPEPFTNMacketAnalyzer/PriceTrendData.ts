import { TimeRange } from "./base";

export interface PriceTrendDataRequest {
    time_range: TimeRange;
}

export type PriceTrendDataItem = { [time: string]: number };

export interface PriceTrendDataResponse {
    buy_trend: PriceTrendDataItem;
    sell_trend: PriceTrendDataItem;
}
