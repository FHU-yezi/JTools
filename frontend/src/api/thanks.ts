import { useData } from "../hooks/useData";

interface GetDebugProjectRecordsResponseRecordsItem {
  id: number;
  date: string;
  type: string;
  module: string;
  description: string;
  userName: string;
  userSlug: string;
  reward: number;
}
interface GetDebugProjectRecordsResponse {
  records: GetDebugProjectRecordsResponseRecordsItem[];
}
export function useDebugProjectRecords() {
  return useData<Record<string, never>, GetDebugProjectRecordsResponse>({
    method: "GET",
    endpoint: "/v1/thanks/debug-project-records",
  });
}
