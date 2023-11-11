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

export interface GetSummaryResponse {
  records: GetSummaryRewardItem[];
}

export interface GetRewardWinsHistoryResponse {
  history: Record<number, number>;
}
