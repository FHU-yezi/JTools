export interface OnRankRecordsRequest {
  user_url?: string;
  user_name?: string;
  sort_by: "onrank_date" | "ranking";
  sort_order: "asc" | "desc";
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
}

export interface RankingSummaryRequest {
  user_url?: string;
  user_name?: string;
}

export interface RankingSummaryResponse {
  top10_count: number;
  top30_count: number;
  top50_count: number;
  total: number;
}
