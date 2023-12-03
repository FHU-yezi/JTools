export interface GetRewardsResponse {
  rewards: string[];
}

export interface GetRecordsRequest {
  offset?: number;
  limit?: number;
  excluded_awards?: string[];
}

export interface GetRecordsItem {
  time: number;
  rewardName: string;
  userName: string;
  userUrl: string;
}

export interface GetRecordsResponse {
  records: GetRecordsItem[];
}

export interface GetSummaryRewardItem {
  rewardName: string;
  winsCount: number;
  winnersCount: number;
  averageWinsCountPerWinner: number;
  winningRate: number;
  rarity: number;
}

export interface GetSummaryRequest {
  range: "1d" | "7d" | "30d" | "all";
}

export interface GetSummaryResponse {
  rewards: GetSummaryRewardItem[];
}

export interface GetRewardWinsHistoryRequest {
  range: "1d" | "30d" | "60d";
  resolution: "1h" | "1d";
}

export interface GetRewardWinsHistoryResponse {
  history: Record<number, number>;
}
