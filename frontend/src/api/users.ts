import { useDataTrigger, useDataTriggerInfinite } from "../hooks/useData";

export interface GetVIPInfoResponse {
  userName: string;
  isVIP: boolean;
  type: "铜牌" | "银牌" | "金牌" | "白金";
  expireDate: number;
}
export function useVIPInfo({ userSlug }: { userSlug: string }) {
  return useDataTrigger<Record<string, never>, GetVIPInfoResponse>({
    method: "GET",
    endpoint: `/v1/users/${userSlug}/vip-info`,
  });
}

interface GetLotteryWinRecordsRequest {
  offset?: number;
  limit?: number;
  excluded_awards?: string[];
}
interface GetLotteryWinRecordItem {
  time: number;
  rewardName: string;
}
export interface GetLotteryWinRecordsResponse {
  records: GetLotteryWinRecordItem[];
}
export function useLotteryWinRecords({
  userSlug,
  limit,
  excluded_awards,
}: { userSlug: string } & GetLotteryWinRecordsRequest) {
  return useDataTriggerInfinite<
    GetLotteryWinRecordsRequest,
    GetLotteryWinRecordsResponse
  >(({ currentPage, previousPageData }) =>
    previousPageData && !previousPageData.records.length
      ? null
      : {
          method: "GET",
          endpoint: `/v1/users/${userSlug}/lottery-win-records`,
          queryArgs: {
            offset: currentPage * 20,
            limit,
            excluded_awards,
          },
        },
  );
}

interface GetOnArticleRankRecordsRequest {
  order_by?: "date" | "ranking";
  order_direction?: "asc" | "desc";
  offset?: number;
  limit?: number;
}
interface GetOnArticleRankRecordItem {
  date: number;
  ranking: number;
  articleTitle: string;
  articleUrl: string;
  FPReward: number;
}
export interface GetOnArticleRankRecordsResponse {
  records: GetOnArticleRankRecordItem[];
}
export function useOnArticleRankRecords({
  userSlug,
  userName,
  order_by,
  order_direction,
  limit,
}: { userSlug?: string; userName?: string } & GetOnArticleRankRecordsRequest) {
  return useDataTriggerInfinite<
    GetOnArticleRankRecordsRequest,
    GetOnArticleRankRecordsResponse
  >(({ currentPage, previousPageData }) =>
    previousPageData && !previousPageData.records.length
      ? null
      : {
          method: "GET",
          endpoint: userSlug
            ? `/v1/users/${userSlug}/on-article-rank-records`
            : `/v1/users/name/${userName}/on-article-rank-records`,
          queryArgs: {
            order_by,
            order_direction,
            offset: currentPage * 20,
            limit,
          },
        },
  );
}

export interface GetOnArticleRankSummaryResponse {
  top10: number;
  top30: number;
  top50: number;
  total: number;
}
export function useOnArticleRankSummary({
  userSlug,
  userName,
}: { userSlug?: string; userName?: string }) {
  return useDataTrigger<Record<string, never>, GetOnArticleRankSummaryResponse>(
    {
      method: "GET",
      endpoint: userSlug
        ? `/v1/users/${userSlug}/on-article-rank-summary`
        : `/v1/users/name/${userName}/on-article-rank-summary`,
    },
  );
}

interface GetNameAutocompleteRequest {
  name_part: string;
  limit?: number;
}
interface GetNameAutocompleteResponse {
  names: string[];
}
export function useNameAutocomplete({
  name_part,
  limit,
}: GetNameAutocompleteRequest) {
  return useDataTrigger<
    GetNameAutocompleteRequest,
    GetNameAutocompleteResponse
  >({
    method: "GET",
    endpoint: "/v1/users/name-autocomplete",
    queryArgs: {
      name_part,
      limit,
    },
  });
}

export interface GetHistoryNamesOnArticleRankSummaryResponse {
  historyNamesOnrankSummary: Record<string, number>;
  userUrl: string;
}
export function useHistoryNamesOnArticleRankSummary({
  userName,
}: { userName: string }) {
  return useDataTrigger<
    Record<string, never>,
    GetHistoryNamesOnArticleRankSummaryResponse
  >({
    method: "GET",
    endpoint: `/v1/users/name/${userName}/history-names-on-article-rank-summary`,
  });
}
