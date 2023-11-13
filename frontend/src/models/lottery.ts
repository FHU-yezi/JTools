export interface GetRewardsResponse {
  rewards: string[];
}

export interface GetRecordItem {
  time: number;
  rewardName: string;
}

export interface GetRecordsResponse {
  records: GetRecordItem[];
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
  range: "1d" | "7d" | "30d";
  resolution: "1h" | "1d";
}

export interface GetRewardWinsHistoryResponse {
  history: Record<number, number>;
}
