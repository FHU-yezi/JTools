export interface VIPInfoRequest {
  user_url: string;
}

export interface VIPInfoResponse {
  name: string;
  VIP_type: string;
  VIP_expire_time?: number;
}
