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

interface GetTechStacksResponseRecordsItem {
  name: string;
  type: "LIBRARY" | "EXTERNAL_SERVICE";
  scope: "FRONTEND" | "BACKEND" | "TOOLCHAIN";
  isSelfDeveloped: boolean;
  description: string;
  url: string;
}
interface GetTechStacksResponse {
  records: GetTechStacksResponseRecordsItem[];
}
export function useTechStacks() {
  return useData<Record<string, never>, GetTechStacksResponse>({
    method: "GET",
    endpoint: "/v1/thanks/tech-stacks",
  });
}
