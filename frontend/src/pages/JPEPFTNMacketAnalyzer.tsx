import { batch, computed, signal } from "@preact/signals";
import { Column, LargeText, Row, Select, SmallText, Text } from "@sscreator/ui";
import { useEffect } from "preact/hooks";
import BarChart from "../components/charts/BarChart";
import LineChart from "../components/charts/LineChart";
import type {
  GetCurrentAmountDistributionRequest,
  GetCurrentAmountDistributionResponse,
  GetCurrentAmountResponse,
  GetCurrentPriceResponse,
  GetPriceHistoryRequest,
  GetPriceHistoryResponse,
  GetRulesResponse,
} from "../models/JPEPFTNMacket";
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

const isPerPriceAmountDataTradeTypeSelectDropdownOpened = signal(false);
const isPriceTrendLineTimeRangeSelectDropdownOpened = signal(false);
const isPoolAmountTrendLineTimeRangeSelectDropdownOpened = signal(false);

function handleRulesFetch() {
  sendRequest<Record<string, never>, GetRulesResponse>({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/rules",
    onSuccess: ({ data }) => (JPEPRules.value = data),
  });
}

function handleCurrentPriceFetch() {
  sendRequest<Record<string, never>, GetCurrentPriceResponse>({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/current-price",
    onSuccess: ({ data }) => (currentPrice.value = data),
  });
}

function handleCurrentAmountFetch() {
  sendRequest<Record<string, never>, GetCurrentAmountResponse>({
    method: "GET",
    endpoint: "/v1/jpep/ftn-macket/current-amount",
    onSuccess: ({ data }) => (currentAmount.value = data),
  });
}

function handleCurrentAmountDistributionFetch() {
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

function handlePriceHistoryFetch() {
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

function handleAmountHistoryDataFetch() {
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

function RulesBlock() {
  return (
    <>
      <Text>平台状态</Text>
      {JPEPRules.value !== undefined ? (
        <Text colorScheme={JPEPRules.value.isOpen ? "success" : "warning"} bold>
          {JPEPRules.value.isOpen ? "开放中" : "休市中"}
        </Text>
      ) : (
        <Text>获取中...</Text>
      )}
      <Row>
        <LargeText bold>
          贝交易手续费
          {JPEPRules.value !== undefined
            ? `${JPEPRules.value.FTNOrderFee * 100}%`
            : "获取中..."}
        </LargeText>
        <LargeText bold>
          商品交易手续费
          {JPEPRules.value !== undefined
            ? `${JPEPRules.value.goodsOrderFee * 100}%`
            : "获取中..."}
        </LargeText>
      </Row>
    </>
  );
}

function CurrentPriceBlock() {
  return (
    <>
      <LargeText bold>实时贝价</LargeText>
      <Row gap="gap-2">
        <LargeText bold>
          买单
          {currentPrice.value?.buyPrice ?? "获取中..."}
        </LargeText>
        <SmallText>
          限价：
          {JPEPRules.value !== undefined
            ? JPEPRules.value.buyOrderMinimumPrice
            : "获取中..."}
        </SmallText>
        <LargeText bold>
          卖单
          {currentPrice.value?.sellPrice ?? "获取中..."}
        </LargeText>
        <SmallText>
          限价：
          {JPEPRules.value !== undefined
            ? JPEPRules.value.sellOrderMinimumPrice
            : "获取中..."}
        </SmallText>
      </Row>
    </>
  );
}

function CurrentAmountBlock() {
  return (
    <>
      <LargeText bold>实时挂单量</LargeText>
      <Row gap="gap-2">
        <Text>买单</Text>
        <LargeText bold>
          {currentAmount.value?.buyAmount ?? "获取中..."}
        </LargeText>
        <SmallText colorScheme="gray">
          {currentAmount.value !== undefined
            ? `占比 ${(
                (currentAmount.value.buyAmount / totalPoolAmount.value!) *
                100
              ).toFixed(2)}%`
            : "获取中..."}
        </SmallText>
        <Text>卖单</Text>
        <LargeText bold>
          {currentAmount.value?.sellAmount ?? "获取中..."}
        </LargeText>
        <SmallText colorScheme="gray">
          {currentAmount.value !== undefined
            ? `占比 ${(
                (currentAmount.value.sellAmount / totalPoolAmount.value!) *
                100
              ).toFixed(2)}%`
            : "获取中..."}
        </SmallText>
      </Row>
    </>
  );
}

function AmountDistributionChartBlock() {
  return (
    <>
      <LargeText bold>实时挂单量分布</LargeText>
      <Select
        id="per-price-amount-data-trade-type"
        isDropdownOpened={isPerPriceAmountDataTradeTypeSelectDropdownOpened}
        value={perPriceAmountDataTradeType}
        options={[
          { label: "买单", value: "buy" },
          { label: "卖单", value: "sell" },
        ]}
      />
      <BarChart
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
    </>
  );
}

function PriceHistoryChartBlock() {
  return (
    <>
      <LargeText bold>贝价趋势</LargeText>
      <Select
        id="price-trend-line-time-range"
        isDropdownOpened={isPriceTrendLineTimeRangeSelectDropdownOpened}
        value={priceTrendLineTimeRange}
        options={TimeRangeSwitchData}
      />
      <LineChart
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
            min: (value) => (value.min - 0.01).toFixed(2),
            max: (value) => (value.max + 0.01).toFixed(2),
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
              color: "#3b82f6",
            },
            {
              type: "line",
              name: "卖贝（右侧）",
              smooth: true,
              data:
                sellPriceTrendData.value === undefined
                  ? undefined
                  : Object.entries(sellPriceTrendData.value),
              color: "#a855f7",
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
    </>
  );
}

function AmountHistoryChartBlock() {
  return (
    <>
      <LargeText bold>挂单量趋势</LargeText>
      <Select
        id="pool-amount-trend-line-time-range"
        isDropdownOpened={isPoolAmountTrendLineTimeRangeSelectDropdownOpened}
        value={poolAmountTrendLineTimeRange}
        options={TimeRangeSwitchData}
      />
      <LineChart
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
              color: "#3b82f6",
            },
            {
              type: "line",
              name: "卖贝（右侧）",
              smooth: true,
              data:
                sellPoolAmountTrendData.value === undefined
                  ? undefined
                  : Object.entries(sellPoolAmountTrendData.value),
              color: "#a855f7",
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
    </>
  );
}

export default function JPEPFTNMarketAnalyzer() {
  useEffect(() => {
    handleRulesFetch();
    handleCurrentPriceFetch();
    handleCurrentAmountFetch();
    handleCurrentAmountDistributionFetch();
    handlePriceHistoryFetch();
    handleAmountHistoryDataFetch();
  }, []);

  useEffect(() => {
    amountDistribution.value = undefined;
    handleCurrentAmountDistributionFetch();
  }, [perPriceAmountDataTradeType.value]);

  useEffect(() => {
    batch(() => {
      buyPriceTrendData.value = undefined;
      sellPriceTrendData.value = undefined;
    });
    handlePriceHistoryFetch();
  }, [priceTrendLineTimeRange.value]);

  useEffect(() => {
    batch(() => {
      buyPoolAmountTrendData.value = undefined;
      sellPoolAmountTrendData.value = undefined;
    });
    handleAmountHistoryDataFetch();
  }, [poolAmountTrendLineTimeRange.value]);

  return (
    <Column>
      <RulesBlock />
      <CurrentPriceBlock />
      <CurrentAmountBlock />

      <AmountDistributionChartBlock />
      <PriceHistoryChartBlock />
      <AmountHistoryChartBlock />
    </Column>
  );
}
