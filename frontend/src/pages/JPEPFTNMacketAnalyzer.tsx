import { SegmentedControl, Skeleton, Stack } from "@mantine/core";
import { Signal, batch, computed, signal } from "@preact/signals";
import {
  ArcElement,
  CategoryScale,
  Chart,
  Colors,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { useEffect } from "preact/hooks";
import { Line } from "react-chartjs-2";
import ChartWrapper from "../components/ChartWrapper";
import SSStat from "../components/SSStat";
import SSText from "../components/SSText";
import { JPEPRulesResponse } from "../models/JPEPFTNMacketAnalyzer/JPEP_rules";
import { PoolAmountResponse } from "../models/JPEPFTNMacketAnalyzer/PoolAmount";
import {
  PoolAmountTrendDataItem,
  PoolAmountTrendDataRequest,
  PoolAmountTrendDataResponse,
} from "../models/JPEPFTNMacketAnalyzer/PoolAmountTrendData";
import { PriceResponse } from "../models/JPEPFTNMacketAnalyzer/Price";
import {
  PriceTrendDataItem,
  PriceTrendDataRequest,
  PriceTrendDataResponse,
} from "../models/JPEPFTNMacketAnalyzer/PriceTrendData";
import { TimeRange } from "../models/JPEPFTNMacketAnalyzer/base";
import { buildSegmentedControlDataFromRecord } from "../utils/data_helper";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";

Chart.register(
  ArcElement,
  CategoryScale,
  Colors,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
);

const TimeRangeSCData = buildSegmentedControlDataFromRecord({
  "24 小时": "24h",
  "7 天": "7d",
  "15 天": "15d",
  "30 天": "30d",
});

const tradeFeePercent = signal<number | undefined>(undefined);
const buyPrice = signal<number | null | undefined>(undefined);
const sellPrice = signal<number | null | undefined>(undefined);
const buyOrderMinimumPrice = signal<number | undefined>(undefined);
const sellOrderMinimumPrice = signal<number | undefined>(undefined);
const buyPoolAmount = signal<number | undefined>(undefined);
const sellPoolAmount = signal<number | undefined>(undefined);
const totalPoolAmount = computed(() =>
  typeof buyPoolAmount.value !== "undefined" &&
  typeof sellPoolAmount.value !== "undefined"
    ? buyPoolAmount.value + sellPoolAmount.value
    : null
);
const PriceTrendLineTimeRange = signal<TimeRange>("24h");
const BuyPriceTrendData = signal<PriceTrendDataItem | undefined>(undefined);
const SellPriceTrendData = signal<PriceTrendDataItem | undefined>(undefined);
const PoolAmountTrendLineTimeRange = signal<TimeRange>("24h");
const BuyPoolAmountTrendData = signal<PoolAmountTrendDataItem | undefined>(
  undefined
);
const SellPoolAmountTrendData = signal<PoolAmountTrendDataItem | undefined>(
  undefined
);

interface PriceTrendLineProps {
  buy: Signal<PriceTrendDataItem>;
  sell: Signal<PriceTrendDataItem>;
}

interface PoolAmountTrendLineProps {
  buy: Signal<PriceTrendDataItem>;
  sell: Signal<PriceTrendDataItem>;
}

function handleJPEPRulesFetch() {
  try {
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
      commonAPIErrorHandler
    );
  } catch {}
}

function handlePriceFetch() {
  try {
    fetchData<Record<string, never>, PriceResponse>(
      "GET",
      "/tools/JPEP_FTN_market_analyzer/price",
      {},
      (data) =>
        batch(() => {
          buyPrice.value = data.buy_price;
          sellPrice.value = data.sell_price;
        }),
      commonAPIErrorHandler
    );
  } catch {}
}

function handlePoolAmountFetch() {
  try {
    fetchData<Record<string, never>, PoolAmountResponse>(
      "GET",
      "/tools/JPEP_FTN_market_analyzer/pool_amount",
      {},
      (data) =>
        batch(() => {
          buyPoolAmount.value = data.buy_amount;
          sellPoolAmount.value = data.sell_amount;
        }),
      commonAPIErrorHandler
    );
  } catch {}
}

function handlePriceTrendDataFetch() {
  try {
    fetchData<PriceTrendDataRequest, PriceTrendDataResponse>(
      "GET",
      "/tools/JPEP_FTN_market_analyzer/price_trend_data",
      {
        time_range: PriceTrendLineTimeRange.value,
      },
      (data) =>
        batch(() => {
          BuyPriceTrendData.value = data.buy_trend;
          SellPriceTrendData.value = data.sell_trend;
        }),
      commonAPIErrorHandler
    );
  } catch {}
}

function handlePoolAmountTrendDataFetch() {
  try {
    fetchData<PoolAmountTrendDataRequest, PoolAmountTrendDataResponse>(
      "GET",
      "/tools/JPEP_FTN_market_analyzer/pool_amount_trend_data",
      {
        time_range: PoolAmountTrendLineTimeRange.value,
      },
      (data) =>
        batch(() => {
          BuyPoolAmountTrendData.value = data.buy_trend;
          SellPoolAmountTrendData.value = data.sell_trend;
        }),
      commonAPIErrorHandler
    );
  } catch {}
}

function PriceTrendLine({ buy, sell }: PriceTrendLineProps) {
  return (
    <Line
      data={{
        labels: Object.keys(buy.value),
        datasets: [
          {
            label: "买贝",
            data: Object.values(buy.value),
            cubicInterpolationMode: "monotone",
          },
          {
            label: "卖贝",
            data: Object.values(sell.value),
            cubicInterpolationMode: "monotone",
          },
          {
            label: "官方推荐参考价格",
            data: new Array(Object.keys(buy.value).length).fill(0.1),
            pointStyle: false,
            borderDash: [5, 5],
          },
        ],
      }}
      options={{
        interaction: {
          intersect: false,
          axis: "x",
        },
        scales: {
          y: {
            suggestedMin: 0.1,
            suggestedMax: 0.17,
          },
        },
        plugins: {
          colors: {
            forceOverride: true,
          },
          legend: {
            labels: {
              filter: (item) => item.text !== "官方推荐参考价格",
            },
          },
        },
      }}
    />
  );
}

function PoolAmountTrendLine({ buy, sell }: PoolAmountTrendLineProps) {
  return (
    <Line
      data={{
        labels: Object.keys(buy.value),
        datasets: [
          {
            label: "买贝",
            data: Object.values(buy.value),
            cubicInterpolationMode: "monotone",
          },
          {
            label: "卖贝",
            data: Object.values(sell.value),
            cubicInterpolationMode: "monotone",
          },
        ],
      }}
      options={{
        interaction: {
          intersect: false,
          axis: "x",
        },
        plugins: {
          colors: {
            forceOverride: true,
          },
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
    handlePriceTrendDataFetch();
    handlePoolAmountTrendDataFetch();
  }, []);

  return (
    <Stack>
      <SSStat
        title="交易手续费"
        value={
          typeof tradeFeePercent.value !== "undefined"
            ? `${tradeFeePercent.value * 100}%`
            : "获取中..."
        }
      />
      <SSText xlarge xbold>
        实时贝价
      </SSText>
      {typeof buyPrice.value !== "undefined" &&
      typeof sellPrice.value !== "undefined" ? (
        <div className="flex gap-2">
          <SSStat
            className="flex-grow"
            title="买单"
            value={buyPrice.value ?? "不可用"}
            desc={`限价：${buyOrderMinimumPrice.value ?? "获取中..."}`}
          />
          <SSStat
            className="flex-grow"
            title="卖单"
            value={sellPrice.value ?? "不可用"}
            desc={`限价：${sellOrderMinimumPrice.value ?? "获取中..."}`}
          />
        </div>
      ) : (
        <Skeleton h={85.5} />
      )}
      <SSText xlarge xbold>
        实时挂单量
      </SSText>
      {typeof buyPoolAmount.value !== "undefined" &&
      typeof sellPoolAmount.value !== "undefined" ? (
        <div className="flex gap-2">
          <SSStat
            className="flex-grow"
            title="买单"
            value={buyPoolAmount.value}
            desc={`占比 ${(
              (buyPoolAmount.value / totalPoolAmount.value!) *
              100
            ).toFixed(2)}%`}
          />
          <SSStat
            className="flex-grow"
            title="卖单"
            value={sellPoolAmount.value}
            desc={`占比 ${(
              (sellPoolAmount.value / totalPoolAmount.value!) *
              100
            ).toFixed(2)}%`}
          />
        </div>
      ) : (
        <Skeleton h={85.5} />
      )}

      <SSText xlarge xbold>
        贝价趋势
      </SSText>
      <SegmentedControl
        value={PriceTrendLineTimeRange.value}
        onChange={(newValue: TimeRange) => {
          batch(() => {
            PriceTrendLineTimeRange.value = newValue;
            BuyPriceTrendData.value = undefined;
            SellPriceTrendData.value = undefined;
          });
          handlePriceTrendDataFetch();
        }}
        data={TimeRangeSCData}
      />
      <ChartWrapper
        chartType="radial"
        show={typeof BuyPriceTrendData.value !== "undefined"}
      >
        <PriceTrendLine
          buy={BuyPriceTrendData as unknown as Signal<PriceTrendDataItem>}
          sell={SellPriceTrendData as unknown as Signal<PriceTrendDataItem>}
        />
      </ChartWrapper>

      <SSText xlarge xbold>
        挂单量趋势
      </SSText>
      <SegmentedControl
        value={PoolAmountTrendLineTimeRange.value}
        onChange={(newValue: TimeRange) => {
          batch(() => {
            PoolAmountTrendLineTimeRange.value = newValue;
            BuyPoolAmountTrendData.value = undefined;
            SellPoolAmountTrendData.value = undefined;
          });
          handlePoolAmountTrendDataFetch();
        }}
        data={TimeRangeSCData}
      />
      <ChartWrapper
        chartType="radial"
        show={typeof BuyPoolAmountTrendData.value !== "undefined"}
      >
        <PoolAmountTrendLine
          buy={
            BuyPoolAmountTrendData as unknown as Signal<PoolAmountTrendDataItem>
          }
          sell={
            SellPoolAmountTrendData as unknown as Signal<PoolAmountTrendDataItem>
          }
        />
      </ChartWrapper>
    </Stack>
  );
}
