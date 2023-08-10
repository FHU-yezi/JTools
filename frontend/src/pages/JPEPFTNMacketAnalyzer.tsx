import { batch, computed, signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import SSCenter from "../components/SSCenter";
import SSSegmentedControl from "../components/SSSegmentedControl";
import SSStat from "../components/SSStat";
import SSText from "../components/SSText";
import SSBarChart from "../components/charts/SSBarChart";
import SSLineChart from "../components/charts/SSLineChart";
import type { JPEPRulesResponse } from "../models/JPEPFTNMacketAnalyzer/JPEPRules";
import type {
  PerPriceAmountDataRequest,
  PerPriceAmountDataResponse,
} from "../models/JPEPFTNMacketAnalyzer/PerPriceAmountData";
import type { PoolAmountResponse } from "../models/JPEPFTNMacketAnalyzer/PoolAmount";
import type {
  PoolAmountTrendDataItem,
  PoolAmountTrendDataRequest,
  PoolAmountTrendDataResponse,
} from "../models/JPEPFTNMacketAnalyzer/PoolAmountTrendData";
import type { PriceResponse } from "../models/JPEPFTNMacketAnalyzer/Price";
import type {
  PriceTrendDataItem,
  PriceTrendDataRequest,
  PriceTrendDataResponse,
} from "../models/JPEPFTNMacketAnalyzer/PriceTrendData";
import type { TimeRange } from "../models/JPEPFTNMacketAnalyzer/base";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";

const TimeRangeSCData = {
  "6 小时": "6h",
  "24 小时": "24h",
  "7 天": "7d",
  "15 天": "15d",
  "30 天": "30d",
};

const tradeFeePercent = signal<number | undefined>(undefined);
const buyPrice = signal<number | null | undefined>(undefined);
const sellPrice = signal<number | null | undefined>(undefined);
const buyOrderMinimumPrice = signal<number | undefined>(undefined);
const sellOrderMinimumPrice = signal<number | undefined>(undefined);
const buyPoolAmount = signal<number | undefined>(undefined);
const sellPoolAmount = signal<number | undefined>(undefined);
const totalPoolAmount = computed(() =>
  buyPoolAmount.value !== undefined && sellPoolAmount.value !== undefined
    ? buyPoolAmount.value + sellPoolAmount.value
    : undefined,
);
const perPriceAmountDataTradeType = signal<"buy" | "sell">("buy");
const perPriceAmountData = signal<Record<number, number> | undefined>(
  undefined,
);
const priceTrendLineTimeRange = signal<TimeRange>("6h");
const buyPriceTrendData = signal<PriceTrendDataItem | undefined>(undefined);
const sellPriceTrendData = signal<PriceTrendDataItem | undefined>(undefined);
const poolAmountTrendLineTimeRange = signal<TimeRange>("6h");
const buyPoolAmountTrendData = signal<PoolAmountTrendDataItem | undefined>(
  undefined,
);
const sellPoolAmountTrendData = signal<PoolAmountTrendDataItem | undefined>(
  undefined,
);

function handleJPEPRulesFetch() {
  fetchData<Record<string, never>, JPEPRulesResponse>(
    "GET",
    "/tools/JPEP_FTN_market_analyzer/JPEP_rules",
    {},
    (data) =>
      batch(() => {
        tradeFeePercent.value = data.trade_fee_percent;
        buyOrderMinimumPrice.value = data.buy_order_minimum_price;
        sellOrderMinimumPrice.value = data.sell_order_minimum_price;
      }),
    commonAPIErrorHandler,
  );
}

function handlePriceFetch() {
  fetchData<Record<string, never>, PriceResponse>(
    "GET",
    "/tools/JPEP_FTN_market_analyzer/price",
    {},
    (data) =>
      batch(() => {
        buyPrice.value = data.buy_price;
        sellPrice.value = data.sell_price;
      }),
    commonAPIErrorHandler,
  );
}

function handlePoolAmountFetch() {
  fetchData<Record<string, never>, PoolAmountResponse>(
    "GET",
    "/tools/JPEP_FTN_market_analyzer/pool_amount",
    {},
    (data) =>
      batch(() => {
        buyPoolAmount.value = data.buy_amount;
        sellPoolAmount.value = data.sell_amount;
      }),
    commonAPIErrorHandler,
  );
}

function handlePerPriceAmountDataFetch() {
  fetchData<PerPriceAmountDataRequest, PerPriceAmountDataResponse>(
    "GET",
    "/tools/JPEP_FTN_market_analyzer/per_price_amount_data",
    {
      trade_type: perPriceAmountDataTradeType.value,
    },
    (data) => (perPriceAmountData.value = data.per_price_amount_data),
    commonAPIErrorHandler,
  );
}

function handlePriceTrendDataFetch() {
  fetchData<PriceTrendDataRequest, PriceTrendDataResponse>(
    "GET",
    "/tools/JPEP_FTN_market_analyzer/price_trend_data",
    {
      time_range: priceTrendLineTimeRange.value,
    },
    (data) =>
      batch(() => {
        buyPriceTrendData.value = data.buy_trend;
        sellPriceTrendData.value = data.sell_trend;
      }),
    commonAPIErrorHandler,
  );
}

function handlePoolAmountTrendDataFetch() {
  fetchData<PoolAmountTrendDataRequest, PoolAmountTrendDataResponse>(
    "GET",
    "/tools/JPEP_FTN_market_analyzer/pool_amount_trend_data",
    {
      time_range: poolAmountTrendLineTimeRange.value,
    },
    (data) =>
      batch(() => {
        buyPoolAmountTrendData.value = data.buy_trend;
        sellPoolAmountTrendData.value = data.sell_trend;
      }),
    commonAPIErrorHandler,
  );
}

function PerPriceAmountDataBar() {
  return (
    <SSBarChart
      className="h-72 max-w-xl w-full"
      dataReady={perPriceAmountData.value !== undefined}
      options={{
        xAxis: {
          type: "category",
          data:
            perPriceAmountData.value === undefined
              ? undefined
              : Object.keys(perPriceAmountData.value),
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            type: "bar",
            data:
              perPriceAmountData.value === undefined
                ? undefined
                : Object.values(perPriceAmountData.value),
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
          type: "category",
          data:
            buyPriceTrendData.value === undefined
              ? undefined
              : Object.keys(buyPriceTrendData.value),
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
              buyPriceTrendData.value === undefined
                ? undefined
                : Object.values(buyPriceTrendData.value),
          },
          {
            type: "line",
            name: "卖贝（右侧）",
            smooth: true,
            data:
              sellPriceTrendData.value === undefined
                ? undefined
                : Object.values(sellPriceTrendData.value),
          },
          {
            type: "line",
            name: "推荐参考价",
            data:
              buyPriceTrendData.value === undefined
                ? undefined
                : new Array(Object.keys(buyPriceTrendData.value).length).fill(
                    0.1,
                  ),
            showSymbol: false,
            lineStyle: {
              type: "dashed",
            },
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
          type: "category",
          data:
            buyPoolAmountTrendData.value === undefined
              ? undefined
              : Object.keys(buyPoolAmountTrendData.value),
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
                : Object.values(buyPoolAmountTrendData.value),
          },
          {
            type: "line",
            name: "卖贝（右侧）",
            smooth: true,
            data:
              sellPoolAmountTrendData.value === undefined
                ? undefined
                : Object.values(sellPoolAmountTrendData.value),
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
    perPriceAmountData.value = undefined;
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
    <div className="flex flex-col gap-4">
      <SSStat
        title="交易手续费"
        value={
          tradeFeePercent.value !== undefined
            ? `${tradeFeePercent.value * 100}%`
            : "获取中..."
        }
      />
      <SSText xlarge xbold>
        实时贝价
      </SSText>
      <div className="flex gap-2">
        <SSStat
          className="flex-grow"
          title="买单"
          value={buyPrice.value ?? "获取中..."}
          desc={`限价：${buyOrderMinimumPrice.value ?? "获取中..."}`}
        />
        <SSStat
          className="flex-grow"
          title="卖单"
          value={sellPrice.value ?? "获取中..."}
          desc={`限价：${sellOrderMinimumPrice.value ?? "获取中..."}`}
        />
      </div>
      <SSText xlarge xbold>
        实时挂单量
      </SSText>
      <div className="flex gap-2">
        <SSStat
          className="flex-grow"
          title="买单"
          value={buyPoolAmount.value ?? "获取中..."}
          desc={
            buyPoolAmount.value !== undefined &&
            totalPoolAmount.value !== undefined
              ? `占比 ${(
                  (buyPoolAmount.value / totalPoolAmount.value) *
                  100
                ).toFixed(2)}%`
              : "获取中..."
          }
        />
        <SSStat
          className="flex-grow"
          title="卖单"
          value={sellPoolAmount.value ?? "获取中..."}
          desc={
            sellPoolAmount.value !== undefined &&
            totalPoolAmount.value !== undefined
              ? `占比 ${(
                  (sellPoolAmount.value / totalPoolAmount.value) *
                  100
                ).toFixed(2)}%`
              : "获取中..."
          }
        />
      </div>

      <SSText xlarge xbold>
        实时挂单量分布
      </SSText>
      <SSCenter>
        <SSSegmentedControl
          label=""
          value={perPriceAmountDataTradeType}
          data={{ 买单: "buy", 卖单: "sell" }}
        />
      </SSCenter>
      <PerPriceAmountDataBar />

      <SSText xlarge xbold>
        贝价趋势
      </SSText>
      <SSCenter>
        <SSSegmentedControl
          label=""
          value={priceTrendLineTimeRange}
          data={TimeRangeSCData}
        />
      </SSCenter>
      <PriceTrendLine />

      <SSText xlarge xbold>
        挂单量趋势
      </SSText>
      <SSCenter>
        <SSSegmentedControl
          label=""
          value={poolAmountTrendLineTimeRange}
          data={TimeRangeSCData}
        />
      </SSCenter>
      <PoolAmountTrendLine />
    </div>
  );
}
