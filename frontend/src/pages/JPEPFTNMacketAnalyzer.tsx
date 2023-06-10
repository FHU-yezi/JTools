import {
  SegmentedControl, Skeleton, Stack, Text, Title,
} from "@mantine/core";
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
import { DataUpdateTimeResponse } from "../models/JPEPFTNMacketAnalyzer/DataUpdateTime";
import { PoolAmountComparePieDataResponse } from "../models/JPEPFTNMacketAnalyzer/PoolAmountComparePieData";
import {
  PriceTrendLineDataItem, PriceTrendLineDataRequest, PriceTrendLineDataResponse, TimeRange,
} from "../models/JPEPFTNMacketAnalyzer/PriceTrendLineData";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { getDatetime } from "../utils/timeHelper";

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

const dataUpdateTime = signal<Date | undefined>(undefined);
const buyPoolAmount = signal(0);
const sellPoolAmount = signal(0);
const PriceTrendLineTimeRange = signal<TimeRange>("24h");
const BuyPriceTrendLineData = signal<PriceTrendLineDataItem | undefined>(
  undefined,
);
const SellPriceTrendLineData = signal<PriceTrendLineDataItem | undefined>(
  undefined,
);

interface PoolAmountComparePieProps {
  buy: Signal<number>
  sell: Signal<number>
}

interface PriceTrendLineProps {
  buy: Signal<PriceTrendLineDataItem>
  sell: Signal<PriceTrendLineDataItem>
}

function handleDataUpdateTimeFetch() {
  try {
    fetchData<Record<string, never>, DataUpdateTimeResponse>(
      "GET",
      "/tools/JPEP_FTN_market_analyzer/data_update_time",
      {},
      (data) => batch(() => {
        dataUpdateTime.value = new Date(data.data_update_time * 1000);
      }),
      commonAPIErrorHandler,
    );
  } catch {}
}

function handlePoolAmountComparePieDataFetch() {
  try {
    fetchData<Record<string, never>, PoolAmountComparePieDataResponse>(
      "GET",
      "/tools/JPEP_FTN_market_analyzer/pool_amount_compare_pie_data",
      {},
      (data) => batch(() => {
        buyPoolAmount.value = data.buy_amount;
        sellPoolAmount.value = data.sell_amount;
      }),
      commonAPIErrorHandler,
    );
  } catch {}
}

function handlePriceTrendLineDataFetch() {
  try {
    fetchData<PriceTrendLineDataRequest, PriceTrendLineDataResponse>(
      "POST",
      "/tools/JPEP_FTN_market_analyzer/price_trend_line_data",
      {
        time_range: PriceTrendLineTimeRange.value,
      },
      (data) => batch(() => {
        BuyPriceTrendLineData.value = data.buy_trend;
        SellPriceTrendLineData.value = data.sell_trend;
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
          { label: "卖贝", data: Object.values(sell.value), cubicInterpolationMode: "monotone" }],
      }}
      options={{
        scales: {
          y: {
            suggestedMin: 0.10,
            suggestedMax: 0.17,
          },
        },
      }}
    />
  );
}

export default function JPEPFTNMarketAnalyzer() {
  useEffect(() => {
    handleDataUpdateTimeFetch();
    handlePoolAmountComparePieDataFetch();
    handlePriceTrendLineDataFetch();
  }, []);

  return (
    <Stack>
      <Text>
        更新时间：
        {dataUpdateTime.value ? getDatetime(dataUpdateTime.value) : "获取中..."}
      </Text>
      <Title order={2}>买卖贝挂单量对比</Title>
      {buyPoolAmount.value !== 0 ? (
        <ChartWrapper>
          <PoolAmountComparePie buy={buyPoolAmount} sell={sellPoolAmount} />
        </ChartWrapper>
      ) : <Skeleton h={500} />}
      <Title order={2}>贝价趋势</Title>
      <SegmentedControl
        value={PriceTrendLineTimeRange.value}
        onChange={(newValue: TimeRange) => {
          PriceTrendLineTimeRange.value = newValue;
          handlePriceTrendLineDataFetch();
        }}
        data={[
          { label: "24 小时", value: "24h" },
          { label: "7 天", value: "7d" },
          { label: "15 天", value: "15d" },
          { label: "30 天", value: "30d" },
        ]}
      />
      {typeof BuyPriceTrendLineData.value !== "undefined" ? (
        <ChartWrapper>
          <PriceTrendLine
            buy={BuyPriceTrendLineData as unknown as Signal<PriceTrendLineDataItem>}
            sell={SellPriceTrendLineData as unknown as Signal<PriceTrendLineDataItem>}
          />
        </ChartWrapper>
      ) : <Skeleton h={500} />}
    </Stack>
  );
}
