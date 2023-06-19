export interface OnRankRecordsRequest {
  user_url?: string;
  user_name?: string;
  offset: number;
}

export interface OnRankRecordItem {
  date: number;
  ranking: number;
  title: string;
  url: string;
  FP_reward_count: number;
}

export interface OnRankRecordsResponse {
  records: OnRankRecordItem[];
  total: number;
}
