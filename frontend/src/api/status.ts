import { useData } from "../hooks/useData";

interface GetResponse {
  version: string;
  downgradedTools: string[];
  unavaliableTools: string[];
}
export function useStatus() {
  return useData<Record<string, never>, GetResponse>({
    method: "GET",
    endpoint: "/v1/status",
  });
}

interface GetToolStatusResponse {
  status: "NORMAL" | "UNAVAILABLE" | "DOWNGRADED";
  reason: string | null;
  lastUpdateTime: number | null;
  dataUpdateFreq: string | null;
  dataCount: number | null;
  dataSource: Record<string, string> | null;
}
export function useToolStatus({ toolSlug }: { toolSlug: string }) {
  return useData<Record<string, never>, GetToolStatusResponse>({
    method: "GET",
    endpoint: `/v1/status/${toolSlug}`,
  });
}
