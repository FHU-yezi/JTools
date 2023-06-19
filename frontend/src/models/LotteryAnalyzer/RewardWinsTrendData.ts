import { TimeRangeWithoutAll } from "./base";

export interface RewardWinsTrendDataRequest {
  time_range: TimeRangeWithoutAll;
}

export type RewardWinsTrendDataItem = { [time: string]: number };

export interface RewardsWinsTrendDataResponse {
  trend_data: RewardWinsTrendDataItem;
}
