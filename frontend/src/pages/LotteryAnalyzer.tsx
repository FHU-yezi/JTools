import {
  Center,
  SegmentedControl,
  Skeleton,
  Stack,
  Table,
  Title,
} from "@mantine/core";
import { Signal, signal } from "@preact/signals";
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
import {
  PerPrizeDataItem,
  PerPrizeDataRequest,
  PerPrizeDataResponse,
} from "../models/LotteryAnalyzer/PerPrizeData";
import {
  RewardsWinsCountPieDataItem,
  RewardsWinsCountPieDataRequest,
  RewardsWinsCountPieDataResponse,
} from "../models/LotteryAnalyzer/RewardWinsCountPieData";
import {
  RewardWinsTrendLineDataItem,
  RewardWinsTrendLineDataRequest,
  RewardsWinsTrendLineDataResponse,
} from "../models/LotteryAnalyzer/RewardWinsTrendLineData";
import { TimeRange, TimeRangeWithoutAll } from "../models/LotteryAnalyzer/base";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { RoundFloat } from "../utils/numberHelper";

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

const perPrizeAnalyzeTimeRange = signal<TimeRange>("1d");
const perPrizeAnalyzeData = signal<PerPrizeDataItem[]>([]);
const RewardWinsCountPieTimeRange = signal<TimeRange>("1d");
const RewardWinsCountPieData = signal<RewardsWinsCountPieDataItem | undefined>(
  undefined,
);
const RewardWinsTrendLineTimeRange = signal<TimeRangeWithoutAll>("1d");
const RewardWinsTrendLineData = signal<RewardWinsTrendLineDataItem | undefined>(
  undefined,
);

interface PerPrizeAnalyzeTableProps {
  data: Signal<PerPrizeDataItem[]>;
}

interface RewardWinsCountPieProps {
  data: Signal<RewardsWinsCountPieDataItem>;
}

interface RewardWinsTrendLineProps {
  data: Signal<RewardWinsTrendLineDataItem>;
}

function handlePerPrizeAnalayzeDataFetch() {
  try {
    fetchData<PerPrizeDataRequest, PerPrizeDataResponse>(
      "POST",
      "/tools/lottery_analyzer/per_prize_data",
      {
        time_range: perPrizeAnalyzeTimeRange.value,
      },
      (data) => (perPrizeAnalyzeData.value = data.rewards),
      commonAPIErrorHandler,
    );
  } catch {}
}

function handleRewardWinsCountPieDataFetch() {
  try {
    fetchData<RewardsWinsCountPieDataRequest, RewardsWinsCountPieDataResponse>(
      "POST",
      "/tools/lottery_analyzer/reward_wins_count_pie_data",
      {
        time_range: RewardWinsCountPieTimeRange.value,
      },
      (data) => (RewardWinsCountPieData.value = data.pie_data),
      commonAPIErrorHandler,
    );
  } catch {}
}

function handleRewardWinsTrendLineDataFetch() {
  try {
    fetchData<RewardWinsTrendLineDataRequest, RewardsWinsTrendLineDataResponse>(
      "POST",
      "/tools/lottery_analyzer/reward_wins_trend_line_data",
      {
        time_range: RewardWinsTrendLineTimeRange.value,
      },
      (data) => (RewardWinsTrendLineData.value = data.line_data),
      commonAPIErrorHandler,
    );
  } catch {}
}

function PerPrizeAnalyzeTable({ data }: PerPrizeAnalyzeTableProps) {
  const totalWins = data.value.reduce((a, b) => a + b.wins_count, 0);
  const totalWinners = data.value.reduce((a, b) => a + b.winners_count, 0);
  const totalAvagaeWinsCountPerWinner = totalWins / totalWinners;

  return (
    <div style={{ overflowX: "scroll" }}>
      <Table style={{ minWidth: 670 }}>
        <thead>
          <tr>
            <th>奖品名称</th>
            <th>中奖次数</th>
            <th>中奖人数</th>
            <th>平均每人中奖次数</th>
            <th>中奖率</th>
            <th>稀有度</th>
          </tr>
        </thead>
        <tbody>
          {data.value.map((item) => (
            <tr>
              <th>{item.reward_name}</th>
              <th>{item.wins_count}</th>
              <th>{item.winners_count}</th>
              <th>{item.average_wins_count_per_winner}</th>
              <th>{RoundFloat(item.winning_rate * 100, 3)}%</th>
              <th>{item.rarity}</th>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>总计</th>
            <th>{totalWins}</th>
            <th>{totalWinners}</th>
            <th>{RoundFloat(totalAvagaeWinsCountPerWinner, 3)}</th>
            <th></th>
            <th></th>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
}

function RewardWinsCountPie({ data }: RewardWinsCountPieProps) {
  return (
    <Center style={{ maxHeight: 500 }}>
      <Pie
        data={{
          labels: Object.keys(data.value),
          datasets: [{ data: Object.values(data.value) }],
        }}
      />
    </Center>
  );
}

function RewardWinsTrendLine({ data }: RewardWinsTrendLineProps) {
  return (
    <Center style={{ maxHeight: 500 }}>
      <Line
        data={{
          labels: Object.keys(data.value),
          datasets: [{ data: Object.values(data.value) }],
        }}
        options={{
          plugins: {
            legend: {
              display: false,
            },
          },
        }}
      />
    </Center>
  );
}

export default function LotteryAnalyzer() {
  useEffect(() => {
    handlePerPrizeAnalayzeDataFetch();
    handleRewardWinsCountPieDataFetch();
    handleRewardWinsTrendLineDataFetch();
  }, []);

  return (
    <Stack>
      <Title order={2}>综合统计</Title>
      <SegmentedControl
        value={perPrizeAnalyzeTimeRange.value}
        onChange={(newValue: TimeRange) => {
          perPrizeAnalyzeTimeRange.value = newValue;
          handlePerPrizeAnalayzeDataFetch();
        }}
        data={[
          { label: "1 天", value: "1d" },
          { label: "7 天", value: "7d" },
          { label: "30 天", value: "30d" },
          { label: "全部", value: "all" },
        ]}
      />
      {perPrizeAnalyzeData.value.length !== 0 ? (
        <PerPrizeAnalyzeTable data={perPrizeAnalyzeData} />
      ) : (
        <Skeleton h={291} />
      )}
      <Title order={2}>中奖次数分布</Title>
      <SegmentedControl
        value={RewardWinsCountPieTimeRange.value}
        onChange={(newValue: TimeRange) => {
          RewardWinsCountPieTimeRange.value = newValue;
          handleRewardWinsCountPieDataFetch();
        }}
        data={[
          { label: "1 天", value: "1d" },
          { label: "7 天", value: "7d" },
          { label: "30 天", value: "30d" },
          { label: "全部", value: "all" },
        ]}
      />
      {typeof RewardWinsCountPieData.value !== "undefined" ? (
        <RewardWinsCountPie
          data={
            RewardWinsCountPieData as unknown as Signal<RewardsWinsCountPieDataItem>
          }
        />
      ) : (
        <Skeleton h={500} />
      )}
      <Title order={2}>中奖次数趋势</Title>
      <SegmentedControl
        value={RewardWinsTrendLineTimeRange.value}
        onChange={(newValue: TimeRangeWithoutAll) => {
          RewardWinsTrendLineTimeRange.value = newValue;
          handleRewardWinsTrendLineDataFetch();
        }}
        data={[
          { label: "1 天", value: "1d" },
          { label: "7 天", value: "7d" },
          { label: "30 天", value: "30d" },
        ]}
      />
      {typeof RewardWinsTrendLineData.value !== "undefined" ? (
        <RewardWinsTrendLine
          data={
            RewardWinsTrendLineData as unknown as Signal<RewardWinsTrendLineDataItem>
          }
        />
      ) : (
        <Skeleton h={500} />
      )}
    </Stack>
  );
}
