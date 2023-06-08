import { TimeRange } from "./base";

export interface PerPrizeDataRequest {
  time_range: TimeRange;
}

export interface PerPrizeDataItem {
  reward_name: string;
  wins_count: number;
  winners_count: number;
  average_wins_count_per_winner: number;
  winning_rate: number;
  rarity: number;
}

export interface PerPrizeDataResponse {
  rewards: PerPrizeDataItem[];
}
