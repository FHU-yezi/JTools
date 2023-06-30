export interface DebugProjectRecordsItem {
  time: string;
  type: string;
  module: string;
  desc: string;
  user_name: string;
  user_url: string;
  award: number;
}

export interface ThanksResponse {
  v3_beta_paticipants: Record<string, string>;
  opensource_packages: Record<string, string>;
  debug_project_records: DebugProjectRecordsItem[];
}
