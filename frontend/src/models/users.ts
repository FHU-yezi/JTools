export enum VIPTypeEnum {
  BRONZE = "bronze",
  SLIVER = "sliver",
  GOLD = "goid",
  PLATINA = "platina",
}

export interface GetVIPInfoResponse {
  userName: string;
  isVIP: boolean;
  type: VIPTypeEnum;
  expireDate: number;
}

export interface GetLotteryWinRecordsRequest {
  offset?: number;
  limit?: number;
  target_rewards?: string[];
}

export interface GetLotteryWinRecordItem {
  time: number;
  rewardName: string;
}

export interface GetLotteryWinRecordsResponse {
  records: GetLotteryWinRecordItem[];
}

export interface GetOnArticleRankRecordsRequest {
  user_slug?: string;
  user_name?: string;
  order_by?: "date" | "ranking";
  order_direction?: "asc" | "desc";
  offset?: number;
  limit?: number;
}

export interface GetOnArticleRankRecordItem {
  date: number;
  ranking: number;
  articleTitle: string;
  articleUrl: string;
  FPReward: number;
}

export interface GetOnArticleRankRecordsResponse {
  records: GetOnArticleRankRecordItem[];
}

export interface GetOnArticleRankSummaryRequest {
  user_slug?: string;
  user_name?: string;
}

export interface GetOnArticleRankSummaryResponse {
  top10: number;
  top30: number;
  top50: number;
  total: number;
}

export interface GetNameAutocompleteRequest {
  name_part: string;
  limit?: number;
}

export interface GetNameAutocompleteResponse {
  names: string[];
}

export interface GetHistoryNamesOnArticleRankSummaryRequest {
  user_name: string;
}

export interface GetHistoryNamesOnArticleRankSummaryResponse {
  historyNamesOnrankSummary: Record<string, number>;
  userUrl: string;
}
