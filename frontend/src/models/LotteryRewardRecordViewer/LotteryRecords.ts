export interface LotteryRecordsRequest {
  user_url: string;
  target_rewards: string[];
}

export interface LotteryRecordItem {
  time: number;
  reward_name: string;
}

export interface LotteryRecordsResponse {
  records: LotteryRecordItem[];
}
