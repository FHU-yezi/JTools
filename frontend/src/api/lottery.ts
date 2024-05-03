import { useData } from "../hooks/useData";

interface GetRewardsResponse {
  rewards: string[];
}
export function useRewards() {
  return useData<Record<string, never>, GetRewardsResponse>({
    method: "GET",
    endpoint: "/v1/lottery/rewards",
  });
}

interface GetRecordsRequest {
  offset?: number;
  limit?: number;
  excluded_awards?: string[];
}
interface GetRecordsItem {
  time: number;
  rewardName: string;
  userName: string;
  userUrl: string;
}
interface GetRecordsResponse {
  records: GetRecordsItem[];
}
export function useRecords({
  offset,
  limit,
  excluded_awards,
}: GetRecordsRequest) {
  return useData<GetRecordsRequest, GetRecordsResponse>({
    method: "GET",
    endpoint: "/v1/lottery/records",
    queryArgs: {
      offset,
      limit,
      excluded_awards,
    },
  });
}

interface GetSummaryRequest {
  range: "1d" | "7d" | "30d" | "all";
}
interface GetSummaryRewardItem {
  rewardName: string;
  winsCount: number;
  winnersCount: number;
  averageWinsCountPerWinner: number;
  winningRate: number;
  rarity: number;
}
export interface GetSummaryResponse {
  rewards: GetSummaryRewardItem[];
}
export function useSummary({ range }: GetSummaryRequest) {
  return useData<GetSummaryRequest, GetSummaryResponse>({
    method: "GET",
    endpoint: "/v1/lottery/summary",
    queryArgs: {
      range,
    },
  });
}

interface GetRewardWinsHistoryRequest {
  range: "1d" | "30d" | "60d";
  resolution: "1h" | "1d";
}
interface GetRewardWinsHistoryResponse {
  history: Record<number, number>;
}
export function useRewardWinsHistory({
  range,
  resolution,
}: GetRewardWinsHistoryRequest) {
  return useData<GetRewardWinsHistoryRequest, GetRewardWinsHistoryResponse>({
    method: "GET",
    endpoint: "/v1/lottery/reward-wins-history",
    queryArgs: {
      range,
      resolution,
    },
  });
}
