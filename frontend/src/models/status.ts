export interface GetResponse {
  version: string;
  downgradedTools: string[];
  unavaliableTools: string[];
}

export enum ToolStatusEnum {
  NORMAL = "NORMAL",
  UNAVALIABLE = "UNAVALIABLE",
  DOWNGRADED = "DOWNGRADED",
}

export interface GetToolStatusResponse {
  status: ToolStatusEnum;
  reason: string | null;
  lastUpdateTime: number | null;
  dataUpdateFreq: string | null;
  dataCount: number | null;
  dataSource: Record<string, string> | null;
}
