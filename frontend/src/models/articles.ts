export interface GetWordFreqResponse {
  title: string;
  wordFreq: Record<string, number>;
}

export interface GetLPRecommendCheckResponse {
  articleTitle: string;
  canRecommendNow: boolean;
  FPReward: number;
  nextCanRecommendDate: number;
}
