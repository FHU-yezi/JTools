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
  reason?: string;
  dataUpdateTime?: number;
  dataUpdateFreq?: string;
  dataCount?: number;
  dataSource?: Record<string, string>;
}
