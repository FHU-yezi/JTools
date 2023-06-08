import { TimeRangeWithoutAll } from "./base";

export interface RewardWinsTrendLineDataRequest {
  time_range: TimeRangeWithoutAll;
}

export type RewardWinsTrendLineDataItem = { [time: string]: number };

export interface RewardsWinsTrendLineDataResponse {
  line_data: RewardWinsTrendLineDataItem;
}
