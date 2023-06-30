export interface WordFreqDataRequest {
  article_url: string;
}

export type WordFreqDataItem = { [word: string]: number };

export interface WordFreqDataResponse {
  title: string;
  word_freq: WordFreqDataItem;
}
