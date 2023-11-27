import { batch, computed, signal } from "@preact/signals";
import { Column, FieldBlock, Row, Switch, Text } from "@sscreator/ui";
import { useEffect } from "preact/hooks";
import SSBarChart from "../components/charts/SSBarChart";
import SSLineChart from "../components/charts/SSLineChart";
import type {
  GetCurrentAmountDistributionRequest,
  GetCurrentAmountDistributionResponse,
  GetCurrentAmountResponse,
  GetCurrentPriceResponse,
  GetPriceHistoryRequest,
  GetPriceHistoryResponse,
  GetRulesResponse,
} from "../models/JPEPFTNMacket";
import { roundFloat } from "../utils/numberHelper";
import { sendRequest } from "../utils/sendRequest";

const TimeRangeSwitchData = [
  { label: "24 小时", value: "24h" },
  { label: "7 天", value: "7d" },
  { label: "15 天", value: "15d" },
  { label: "30 天", value: "30d" },
];

type TimeRange = "24h" | "7d" | "15d" | "30d";

const currentPrice = signal<GetCurrentPriceResponse | undefined>(undefined);
const currentAmount = signal<GetCurrentAmountResponse | undefined>(undefined);
const totalPoolAmount = computed(() =>
  currentAmount.value !== undefined
    ? currentAmount.value.buyAmount + currentAmount.value.sellAmount
    : undefined,
);
const JPEPRules = signal<GetRulesResponse | undefined>(undefined);
const perPriceAmountDataTradeType = signal<"buy" | "sell">("buy");
const amountDistribution = signal<Record<number, number> | undefined>(
  undefined,
);
const priceTrendLineTimeRange = signal<TimeRange>("24h");
const buyPriceTrendData = signal<Record<number, number> | undefined>(undefined);
const sellPriceTrendData = signal<Record<number, number> | undefined>(
  undefined,
);
const poolAmountTrendLineTimeRange = signal<TimeRange>("24h");
const buyPoolAmountTrendData = signal<Record<number, number> | undefined>(
  undefined,
);
const sellPoolAmountTrendData = signal<Record<number, number> | undefined>(
  undefined,
);

function handleJPEPRulesFetch() {
  sendRequest<Record<string, never>, GetRulesResponse>({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/rules",
    onSuccess: ({ data }) => (JPEPRules.value = data),
  });
}

function handlePriceFetch() {
  sendRequest<Record<string, never>, GetCurrentPriceResponse>({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/current-price",
    onSuccess: ({ data }) => (currentPrice.value = data),
  });
}

function handlePoolAmountFetch() {
  sendRequest<Record<string, never>, GetCurrentAmountResponse>({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/current-amount",
    onSuccess: ({ data }) => (currentAmount.value = data),
  });
}

function handlePerPriceAmountDataFetch() {
  sendRequest<
    GetCurrentAmountDistributionRequest,
    GetCurrentAmountDistributionResponse
  >({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/current-amount-distribution",
    queryArgs: {
      type: perPriceAmountDataTradeType.value,
    },
    onSuccess: ({ data }) =>
      (amountDistribution.value = data.amountDistribution),
  });
}

function handlePriceTrendDataFetch() {
  sendRequest<GetPriceHistoryRequest, GetPriceHistoryResponse>({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/price-history",
    queryArgs: {
      type: "buy",
      range: priceTrendLineTimeRange.value,
      resolution: priceTrendLineTimeRange.value === "24h" ? "5m" : "1d",
    },
    onSuccess: ({ data }) => (buyPriceTrendData.value = data.history),
  });

  sendRequest<GetPriceHistoryRequest, GetPriceHistoryResponse>({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/price-history",
    queryArgs: {
      type: "sell",
      range: priceTrendLineTimeRange.value,
      resolution: priceTrendLineTimeRange.value === "24h" ? "5m" : "1d",
    },
    onSuccess: ({ data }) => (sellPriceTrendData.value = data.history),
  });
}

function handlePoolAmountTrendDataFetch() {
  sendRequest<GetPriceHistoryRequest, GetPriceHistoryResponse>({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/amount-history",
    queryArgs: {
      type: "buy",
      range: poolAmountTrendLineTimeRange.value,
      resolution: poolAmountTrendLineTimeRange.value === "24h" ? "5m" : "1d",
    },
    onSuccess: ({ data }) => (buyPoolAmountTrendData.value = data.history),
  });

  sendRequest<GetPriceHistoryRequest, GetPriceHistoryResponse>({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/amount-history",
    queryArgs: {
      type: "sell",
      range: poolAmountTrendLineTimeRange.value,
      resolution: poolAmountTrendLineTimeRange.value === "24h" ? "5m" : "1d",
    },
    onSuccess: ({ data }) => (sellPoolAmountTrendData.value = data.history),
  });
}

function PerPriceAmountDataBar() {
  return (
    <SSBarChart
      className="h-72 max-w-xl w-full"
      dataReady={amountDistribution.value !== undefined}
      options={{
        xAxis: {
          type: "category",
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            type: "bar",
            data:
              amountDistribution.value === undefined
                ? undefined
                : Object.entries(amountDistribution.value),
          },
        ],
        tooltip: {
          show: true,
          trigger: "axis",
        },
      }}
    />
  );
}

function PriceTrendLine() {
  return (
    <SSLineChart
      className="h-72 max-w-lg w-full"
      dataReady={
        buyPriceTrendData.value !== undefined &&
        sellPriceTrendData.value !== undefined
      }
      options={{
        xAxis: {
          type: "time",
        },
        yAxis: {
          type: "value",
          min: (value) => roundFloat(value.min - 0.01, 2),
          max: (value) => roundFloat(value.max + 0.01, 2),
        },
        series: [
          {
            type: "line",
            name: "买贝（左侧）",
            smooth: true,
            data:
              buyPriceTrendData.value === undefined
                ? undefined
                : Object.entries(buyPriceTrendData.value),
          },
          {
            type: "line",
            name: "卖贝（右侧）",
            smooth: true,
            data:
              sellPriceTrendData.value === undefined
                ? undefined
                : Object.entries(sellPriceTrendData.value),
          },
        ],
        legend: {
          show: true,
        },
        tooltip: {
          show: true,
          trigger: "axis",
        },
      }}
    />
  );
}

function PoolAmountTrendLine() {
  return (
    <SSLineChart
      className="h-72 max-w-lg w-full"
      dataReady={
        buyPoolAmountTrendData.value !== undefined &&
        sellPoolAmountTrendData.value !== undefined
      }
      options={{
        xAxis: {
          type: "time",
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            type: "line",
            name: "买贝（左侧）",
            smooth: true,
            data:
              buyPoolAmountTrendData.value === undefined
                ? undefined
                : Object.entries(buyPoolAmountTrendData.value),
          },
          {
            type: "line",
            name: "卖贝（右侧）",
            smooth: true,
            data:
              sellPoolAmountTrendData.value === undefined
                ? undefined
                : Object.entries(sellPoolAmountTrendData.value),
          },
        ],
        tooltip: {
          show: true,
          trigger: "axis",
        },
      }}
    />
  );
}

export default function JPEPFTNMarketAnalyzer() {
  useEffect(() => {
    handleJPEPRulesFetch();
    handlePriceFetch();
    handlePoolAmountFetch();
    handlePerPriceAmountDataFetch();
    handlePriceTrendDataFetch();
    handlePoolAmountTrendDataFetch();
  }, []);

  useEffect(() => {
    amountDistribution.value = undefined;
    handlePerPriceAmountDataFetch();
  }, [perPriceAmountDataTradeType.value]);

  useEffect(() => {
    batch(() => {
      buyPriceTrendData.value = undefined;
      sellPriceTrendData.value = undefined;
    });
    handlePriceTrendDataFetch();
  }, [priceTrendLineTimeRange.value]);

  useEffect(() => {
    batch(() => {
      buyPoolAmountTrendData.value = undefined;
      sellPoolAmountTrendData.value = undefined;
    });
    handlePoolAmountTrendDataFetch();
  }, [poolAmountTrendLineTimeRange.value]);

  return (
    <Column>
      <Row>
        <FieldBlock rowClassName="flex-grow" fieldName="贝交易手续费">
          <Text large bold>
            {JPEPRules.value !== undefined
              ? `${JPEPRules.value.FTNOrderFee * 100}%`
              : "获取中..."}
          </Text>
        </FieldBlock>
        <FieldBlock rowClassName="flex-grow" fieldName="商品交易手续费">
          <Text large bold>
            {JPEPRules.value !== undefined
              ? `${JPEPRules.value.goodsOrderFee * 100}%`
              : "获取中..."}
          </Text>
        </FieldBlock>
      </Row>
      <Text large bold>
        实时贝价
      </Text>
      <Row gap="gap-2">
        <FieldBlock rowClassName="flex-grow" fieldName="买单">
          <Text large bold>
            {currentPrice.value?.buyPrice ?? "获取中..."}
          </Text>
          <Text small gray>
            限价：
            {JPEPRules.value !== undefined
              ? JPEPRules.value.buyOrderMinimumPrice
              : "获取中..."}
          </Text>
        </FieldBlock>
        <FieldBlock rowClassName="flex-grow" fieldName="卖单">
          <Text large bold>
            {currentPrice.value?.sellPrice ?? "获取中..."}
          </Text>
          <Text small gray>
            限价：
            {JPEPRules.value !== undefined
              ? JPEPRules.value.sellOrderMinimumPrice
              : "获取中..."}
          </Text>
        </FieldBlock>
      </Row>
      <Text large bold>
        实时挂单量
      </Text>
      <Row gap="gap-2">
        <FieldBlock rowClassName="flex-grow" fieldName="买单">
          <Text large bold>
            {currentAmount.value?.buyAmount ?? "获取中..."}
          </Text>
          <Text small gray>
            {currentAmount.value !== undefined
              ? `占比 ${(
                  (currentAmount.value.buyAmount / totalPoolAmount.value!) *
                  100
                ).toFixed(2)}%`
              : "获取中..."}
          </Text>
        </FieldBlock>
        <FieldBlock rowClassName="flex-grow" fieldName="卖单">
          <Text large bold>
            {currentAmount.value?.sellAmount ?? "获取中..."}
          </Text>
          <Text small gray>
            {currentAmount.value !== undefined
              ? `占比 ${(
                  (currentAmount.value.sellAmount / totalPoolAmount.value!) *
                  100
                ).toFixed(2)}%`
              : "获取中..."}
          </Text>
        </FieldBlock>
      </Row>

      <Text large bold>
        实时挂单量分布
      </Text>
      <Switch
        value={perPriceAmountDataTradeType}
        data={[
          { label: "买单", value: "buy" },
          { label: "卖单", value: "sell" },
        ]}
      />
      <PerPriceAmountDataBar />

      <Text large bold>
        贝价趋势
      </Text>
      <Switch value={priceTrendLineTimeRange} data={TimeRangeSwitchData} />
      <PriceTrendLine />

      <Text large bold>
        挂单量趋势
      </Text>
      <Switch value={poolAmountTrendLineTimeRange} data={TimeRangeSwitchData} />
      <PoolAmountTrendLine />
    </Column>
  );
}
