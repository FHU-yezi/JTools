import type { TimeRange } from "./base";

export interface RewardsWinsCountDataRequest {
  time_range: TimeRange;
}

export type RewardsWinsCountDataItem = { [reward_name: string]: number };

export interface RewardsWinsCountDataResponse {
  wins_count_data: RewardsWinsCountDataItem;
}
