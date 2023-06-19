export interface LotteryRecordsRequest {
  user_url: string;
  target_rewards: string[];
  offset: number;
}

export interface LotteryRecordItem {
  time: number;
  reward_name: string;
}

export interface LotteryRecordsResponse {
  records: LotteryRecordItem[];
  total: number;
}
