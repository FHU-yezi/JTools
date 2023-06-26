import { SegmentedControl, Stack, Title } from "@mantine/core";
import { Signal, batch, signal } from "@preact/signals";
import {
  ArcElement,
  CategoryScale,
  Chart,
  Colors,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PieController,
  PointElement,
  Tooltip,
} from "chart.js";
import { useEffect } from "preact/hooks";
import { Line, Pie } from "react-chartjs-2";
import ChartWrapper from "../components/ChartWrapper";
import { PoolAmountDataResponse } from "../models/JPEPFTNMacketAnalyzer/PoolAmountData";
import { PoolAmountTrendDataItem, PoolAmountTrendDataRequest, PoolAmountTrendDataResponse } from "../models/JPEPFTNMacketAnalyzer/PoolAmountTrendData";
import {
  PriceTrendDataItem, PriceTrendDataRequest, PriceTrendDataResponse,
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
  PieController,
  PointElement,
  Tooltip,
);

const TimeRangeSCData = buildSegmentedControlDataFromRecord({
  "24 小时": "24h",
  "7 天": "7d",
  "15 天": "15d",
  "30 天": "30d",
});

const buyPoolAmount = signal(0);
const sellPoolAmount = signal(0);
const PriceTrendLineTimeRange = signal<TimeRange>("24h");
const BuyPriceTrendData = signal<PriceTrendDataItem | undefined>(
  undefined,
);
const SellPriceTrendData = signal<PriceTrendDataItem | undefined>(
  undefined,
);
const PoolAmountTrendLineTimeRange = signal<TimeRange>("24h");
const BuyPoolAmountTrendData = signal<PoolAmountTrendDataItem | undefined>(
  undefined,
);
const SellPoolAmountTrendData = signal<PoolAmountTrendDataItem | undefined>(
  undefined,
);

interface PoolAmountComparePieProps {
  buy: Signal<number>
  sell: Signal<number>
}

interface PriceTrendLineProps {
  buy: Signal<PriceTrendDataItem>
  sell: Signal<PriceTrendDataItem>
}

interface PoolAmountTrendLineProps {
  buy: Signal<PriceTrendDataItem>
  sell: Signal<PriceTrendDataItem>
}

function handlePoolAmountDataFetch() {
  try {
    fetchData<Record<string, never>, PoolAmountDataResponse>(
      "GET",
      "/tools/JPEP_FTN_market_analyzer/pool_amount_data",
      {},
      (data) => batch(() => {
        buyPoolAmount.value = data.buy_amount;
        sellPoolAmount.value = data.sell_amount;
      }),
      commonAPIErrorHandler,
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
      (data) => batch(() => {
        BuyPriceTrendData.value = data.buy_trend;
        SellPriceTrendData.value = data.sell_trend;
      }),
      commonAPIErrorHandler,
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
      (data) => batch(() => {
        BuyPoolAmountTrendData.value = data.buy_trend;
        SellPoolAmountTrendData.value = data.sell_trend;
      }),
      commonAPIErrorHandler,
    );
  } catch {}
}

function PoolAmountComparePie({ buy, sell }: PoolAmountComparePieProps) {
  return (
    <Pie
      data={{
        labels: ["买贝", "卖贝"],
        datasets: [{ data: [buy.value, sell.value] }],
      }}
    />
  );
}

function PriceTrendLine({ buy, sell }: PriceTrendLineProps) {
  return (
    <Line
      data={{
        labels: Object.keys(buy.value),
        datasets: [
          { label: "买贝", data: Object.values(buy.value), cubicInterpolationMode: "monotone" },
          { label: "卖贝", data: Object.values(sell.value), cubicInterpolationMode: "monotone" },
          {
            label: "官方推荐参考价格",
            data: new Array(Object.keys(buy.value).length).fill(0.10),
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
            suggestedMin: 0.10,
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
          { label: "买贝", data: Object.values(buy.value), cubicInterpolationMode: "monotone" },
          { label: "卖贝", data: Object.values(sell.value), cubicInterpolationMode: "monotone" },
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
    handlePoolAmountDataFetch();
    handlePriceTrendDataFetch();
    handlePoolAmountTrendDataFetch();
  }, []);

  return (
    <Stack>
      <Title order={3}>买卖贝挂单量对比</Title>
      <ChartWrapper chartType="pie" show={buyPoolAmount.value !== 0}>
        <PoolAmountComparePie buy={buyPoolAmount} sell={sellPoolAmount} />
      </ChartWrapper>

      <Title order={3}>贝价趋势</Title>
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
      <ChartWrapper chartType="radial" show={typeof BuyPriceTrendData.value !== "undefined"}>
        <PriceTrendLine
          buy={BuyPriceTrendData as unknown as Signal<PriceTrendDataItem>}
          sell={SellPriceTrendData as unknown as Signal<PriceTrendDataItem>}
        />
      </ChartWrapper>

      <Title order={3}>挂单量趋势</Title>
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
      <ChartWrapper chartType="radial" show={typeof BuyPoolAmountTrendData.value !== "undefined"}>
        <PoolAmountTrendLine
          buy={BuyPoolAmountTrendData as unknown as Signal<PoolAmountTrendDataItem>}
          sell={SellPoolAmountTrendData as unknown as Signal<PoolAmountTrendDataItem>}
        />
      </ChartWrapper>
    </Stack>
  );
}
