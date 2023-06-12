import {
  SegmentedControl, Stack, Text, Title,
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
import { PoolAmountDataResponse } from "../models/JPEPFTNMacketAnalyzer/PoolAmountData";
import {
  PriceTrendDataItem, PriceTrendDataRequest, PriceTrendDataResponse, TimeRange,
} from "../models/JPEPFTNMacketAnalyzer/PriceTrendData";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { getDatetime, parseTime } from "../utils/timeHelper";

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
const BuyPriceTrendData = signal<PriceTrendDataItem | undefined>(
  undefined,
);
const SellPriceTrendData = signal<PriceTrendDataItem | undefined>(
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

function handleDataUpdateTimeFetch() {
  try {
    fetchData<Record<string, never>, DataUpdateTimeResponse>(
      "GET",
      "/tools/JPEP_FTN_market_analyzer/data_update_time",
      {},
      (data) => batch(() => {
        dataUpdateTime.value = parseTime(data.data_update_time);
      }),
      commonAPIErrorHandler,
    );
  } catch {}
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

export default function JPEPFTNMarketAnalyzer() {
  useEffect(() => {
    handleDataUpdateTimeFetch();
    handlePoolAmountDataFetch();
    handlePriceTrendDataFetch();
  }, []);

  return (
    <Stack>
      <Text>
        更新时间：
        {dataUpdateTime.value ? getDatetime(dataUpdateTime.value) : "获取中..."}
      </Text>
      <Title order={2}>买卖贝挂单量对比</Title>
      <ChartWrapper chartType="pie" show={buyPoolAmount.value !== 0}>
        <PoolAmountComparePie buy={buyPoolAmount} sell={sellPoolAmount} />
      </ChartWrapper>
      <Title order={2}>贝价趋势</Title>
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
        data={[
          { label: "24 小时", value: "24h" },
          { label: "7 天", value: "7d" },
          { label: "15 天", value: "15d" },
          { label: "30 天", value: "30d" },
        ]}
      />
      <ChartWrapper chartType="radial" show={typeof BuyPriceTrendData.value !== "undefined"}>
        <PriceTrendLine
          buy={BuyPriceTrendData as unknown as Signal<PriceTrendDataItem>}
          sell={SellPriceTrendData as unknown as Signal<PriceTrendDataItem>}
        />
      </ChartWrapper>
    </Stack>
  );
}
