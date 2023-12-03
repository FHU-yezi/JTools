export interface GetRulesResponse {
  isOpen: boolean;
  buyOrderMinimumPrice: number;
  sellOrderMinimumPrice: number;
  FTNOrderFee: number;
  goodsOrderFee: number;
}

export interface GetCurrentPriceResponse {
  buyPrice: number;
  sellPrice: number;
}
export interface GetCurrentAmountResponse {
  buyAmount: number;
  sellAmount: number;
}

export interface GetPriceHistoryRequest {
  type: "buy" | "sell";
  range: "24h" | "7d" | "15d" | "30d";
  resolution: "5m" | "1h" | "1d";
}

export interface GetPriceHistoryResponse {
  history: Record<number, number>;
}

export interface GetAmountHistoryRequest {
  type: "buy" | "sell";
  range: "24h" | "7d" | "15d" | "30d";
  resolution: "5m" | "1h" | "1d";
}

export interface GetAmountHistoryResponse {
  history: Record<number, number>;
}

export interface GetCurrentAmountDistributionRequest {
  type: "buy" | "sell";
  limit?: number;
}

export interface GetCurrentAmountDistributionResponse {
  amountDistribution: Record<number, number>;
}
