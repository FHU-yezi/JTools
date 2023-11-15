export interface GetWordFreqResponse {
  title: string;
  wordFreq: Record<string, number>;
}

export interface GetLPRecommendCheckResponse {
  articleTitle: string;
  FPReward: number;
  nextCanRecommendDate: number;
}
