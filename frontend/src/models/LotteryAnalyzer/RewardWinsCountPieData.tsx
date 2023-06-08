import { TimeRange } from "./base";

export interface RewardsWinsCountPieDataRequest {
  time_range: TimeRange;
}

export type RewardsWinsCountPieDataItem = { [reward_name: string]: number };

export interface RewardsWinsCountPieDataResponse {
  pie_data: RewardsWinsCountPieDataItem;
}
