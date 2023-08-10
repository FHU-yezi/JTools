export interface SameURLRecordsSummaryRequest {
  user_name: string;
}

export interface SameURLRecordsSummaryResponse {
  records: Record<string, number>;
  user_url?: string;
}
