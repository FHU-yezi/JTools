import { useData } from "../hooks/useData";

interface GetRulesResponse {
  isOpen: boolean;
  buyOrderMinimumPrice: number;
  sellOrderMinimumPrice: number;
  FTNOrderFee: number;
  goodsOrderFee: number;
}
export function useRules() {
  return useData<Record<string, never>, GetRulesResponse>({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/rules",
  });
}

interface GetCurrentPriceResponse {
  buyPrice: number;
  sellPrice: number;
}
export function useCurrentPrice() {
  return useData<Record<string, never>, GetCurrentPriceResponse>({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/current-price",
  });
}

interface GetCurrentAmountResponse {
  buyAmount: number;
  sellAmount: number;
}
export function useCurrentAmount() {
  return useData<Record<string, never>, GetCurrentAmountResponse>({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/current-amount",
  });
}

interface GetCurrentAmountDistributionRequest {
  type: "buy" | "sell";
  limit?: number;
}
interface GetCurrentAmountDistributionResponse {
  amountDistribution: Record<number, number>;
}
export function useCurrentAmountDistribution({
  type,
  limit,
}: GetCurrentAmountDistributionRequest) {
  return useData<
    GetCurrentAmountDistributionRequest,
    GetCurrentAmountDistributionResponse
  >({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/current-amount-distribution",
    queryArgs: {
      type,
      limit,
    },
  });
}

interface GetPriceHistoryRequest {
  type: "buy" | "sell";
  range: "24h" | "7d" | "15d" | "30d";
  resolution: "5m" | "1h" | "1d";
}
interface GetPriceHistoryResponse {
  history: Record<number, number>;
}
export function usePriceHistory({
  type,
  range,
  resolution,
}: GetPriceHistoryRequest) {
  return useData<GetPriceHistoryRequest, GetPriceHistoryResponse>({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/price-history",
    queryArgs: {
      type,
      range,
      resolution,
    },
  });
}

interface GetAmountHistoryRequest {
  type: "buy" | "sell";
  range: "24h" | "7d" | "15d" | "30d";
  resolution: "5m" | "1h" | "1d";
}
interface GetAmountHistoryResponse {
  history: Record<number, number>;
}
export function useAmountHistory({
  type,
  range,
  resolution,
}: GetAmountHistoryRequest) {
  return useData<GetAmountHistoryRequest, GetAmountHistoryResponse>({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/amount-history",
    queryArgs: {
      type,
      range,
      resolution,
    },
  });
}
