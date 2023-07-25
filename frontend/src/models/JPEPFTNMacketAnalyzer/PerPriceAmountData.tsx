export interface PerPriceAmountDataRequest {
  trade_type: "buy" | "sell";
}

export interface PerPriceAmountDataResponse {
  per_price_amount_data: Record<number, number>;
}
