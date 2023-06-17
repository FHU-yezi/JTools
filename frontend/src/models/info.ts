/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-shadow
export enum InfoStatus {
    NORMAL = 0,
    UNAVALIABLE = 1,
    DOWNGRADED = 2,
}

export interface InfoRequest {
    tool_slug: string;
}

export interface InfoResponse {
    status: InfoStatus;
    unavaliable_reason: string;
    downgraded_reason: string;
    data_update_time?: number;
    data_update_freq_desc?: string;
    data_count?: number;
    data_source?: { [name: string]: string };
}