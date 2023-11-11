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

export interface GetPriceHistoryResponse {
  history: Record<number, number>;
}

export interface GetAmountHistoryResponse {
  history: Record<number, number>;
}

export interface GetCurrentAmountDistributionResponse {
  amountDistribution: Record<number, number>;
}
