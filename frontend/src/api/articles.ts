import { useDataTrigger } from "../hooks/useData";

export interface GetWordFreqResponse {
  title: string;
  wordFreq: Record<string, number>;
}
export function useWordFreq({ articleSlug }: { articleSlug: string }) {
  return useDataTrigger<Record<string, never>, GetWordFreqResponse>({
    method: "GET",
    endpoint: `/v1/articles/${articleSlug}/word-freq`,
  });
}

export interface GetLPRecommendCheckResponse {
  articleTitle: string;
  canRecommendNow: boolean;
  FPReward: number;
  nextCanRecommendDate: string;
}
export function useLPRecommendCheck({ articleSlug }: { articleSlug: string }) {
  return useDataTrigger<Record<string, never>, GetLPRecommendCheckResponse>({
    method: "GET",
    endpoint: `/v1/articles/${articleSlug}/lp-recommend-check`,
  });
}
