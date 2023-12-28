export enum VIPTypeEnum {
  BRONZE = "铜牌",
  SLIVER = "银牌",
  GOLD = "金牌",
  PLATINA = "白金",
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
  excluded_awards?: string[];
}

export interface GetLotteryWinRecordItem {
  time: number;
  rewardName: string;
}

export interface GetLotteryWinRecordsResponse {
  records: GetLotteryWinRecordItem[];
}

export interface GetOnArticleRankRecordsRequest {
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

export interface GetHistoryNamesOnArticleRankSummaryResponse {
  historyNamesOnrankSummary: Record<string, number>;
  userUrl: string;
}
