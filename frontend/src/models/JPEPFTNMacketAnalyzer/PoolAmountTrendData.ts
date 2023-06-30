import { TimeRange } from "./base";

export interface PoolAmountTrendDataRequest {
  time_range: TimeRange;
}

export type PoolAmountTrendDataItem = { [time: string]: number };

export interface PoolAmountTrendDataResponse {
  buy_trend: PoolAmountTrendDataItem;
  sell_trend: PoolAmountTrendDataItem;
}
