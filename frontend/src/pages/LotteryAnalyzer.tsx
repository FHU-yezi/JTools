import { Table } from "@mantine/core";
import { signal } from "@preact/signals";
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
import SSScolllable from "../components/SSScollable";
import SSSegmentedControl from "../components/SSSegmentedControl";
import SSSkeleton from "../components/SSSkeleton";
import SSText from "../components/SSText";
import SSTooltip from "../components/SSTooltip";
import {
  PerPrizeDataItem,
  PerPrizeDataRequest,
  PerPrizeDataResponse,
} from "../models/LotteryAnalyzer/PerPrizeData";
import {
  RewardsWinsCountDataItem,
  RewardsWinsCountDataRequest,
  RewardsWinsCountDataResponse,
} from "../models/LotteryAnalyzer/RewardWinsCountData";
import {
  RewardWinsTrendDataItem,
  RewardWinsTrendDataRequest,
  RewardsWinsTrendDataResponse,
} from "../models/LotteryAnalyzer/RewardWinsTrendData";
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
  Tooltip
);

const timeRangeSCData = {
  "1 天": "1d",
  "7 天": "7d",
  "30 天": "30d",
  全部: "all",
};
const timeRangeWithoutAllSCData = {
  "1 天": "1d",
  "7 天": "7d",
  "30 天": "30d",
};

const perPrizeAnalyzeTimeRange = signal<TimeRange>("1d");
const perPrizeAnalyzeData = signal<PerPrizeDataItem[] | undefined>([]);
const RewardWinsCountPieTimeRange = signal<TimeRange>("1d");
const RewardWinsCountData = signal<RewardsWinsCountDataItem | undefined>(
  undefined
);
const RewardWinsTrendLineTimeRange = signal<TimeRangeWithoutAll>("1d");
const RewardWinsTrendData = signal<RewardWinsTrendDataItem | undefined>(
  undefined
);

interface PerPrizeAnalyzeTableProps {
  data: PerPrizeDataItem[];
}

interface RewardWinsCountPieProps {
  data: RewardsWinsCountDataItem;
}

interface RewardWinsTrendLineProps {
  data: RewardWinsTrendDataItem;
}

function handlePerPrizeAnalayzeDataFetch() {
  try {
    fetchData<PerPrizeDataRequest, PerPrizeDataResponse>(
      "GET",
      "/tools/lottery_analyzer/per_prize_data",
      {
        time_range: perPrizeAnalyzeTimeRange.value,
      },
      (data) => (perPrizeAnalyzeData.value = data.rewards),
      commonAPIErrorHandler
    );
  } catch {}
}

function handleRewardWinsCountDataFetch() {
  try {
    fetchData<RewardsWinsCountDataRequest, RewardsWinsCountDataResponse>(
      "GET",
      "/tools/lottery_analyzer/reward_wins_count_data",
      {
        time_range: RewardWinsCountPieTimeRange.value,
      },
      (data) => (RewardWinsCountData.value = data.wins_count_data),
      commonAPIErrorHandler
    );
  } catch {}
}

function handleRewardWinsTrendDataFetch() {
  try {
    fetchData<RewardWinsTrendDataRequest, RewardsWinsTrendDataResponse>(
      "GET",
      "/tools/lottery_analyzer/reward_wins_trend_data",
      {
        time_range: RewardWinsTrendLineTimeRange.value,
      },
      (data) => (RewardWinsTrendData.value = data.trend_data),
      commonAPIErrorHandler
    );
  } catch {}
}

function PerPrizeAnalyzeTable({ data }: PerPrizeAnalyzeTableProps) {
  const totalWins = data.reduce((a, b) => a + b.wins_count, 0);
  const totalWinners = data.reduce((a, b) => a + b.winners_count, 0);
  const totalAvagaeWinsCountPerWinner = totalWins / totalWinners;

  return (
    <SSScolllable>
      <Table className="min-w-[670px]">
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
          {data.map((item) => (
            <tr key={item.reward_name}>
              <td>{item.reward_name}</td>
              <td>{item.wins_count}</td>
              <td>{item.winners_count}</td>
              <td>{item.average_wins_count_per_winner}</td>
              <td>{RoundFloat(item.winning_rate * 100, 3)}%</td>
              <td>{item.rarity}</td>
            </tr>
          ))}
        </tbody>
        {data.length !== 0 && (
          <tfoot>
            <tr>
              <th>总计</th>
              <th>{totalWins}</th>
              <th>{totalWinners}</th>
              <th>{RoundFloat(totalAvagaeWinsCountPerWinner, 3)}</th>
              <th />
              <th />
            </tr>
          </tfoot>
        )}
      </Table>
    </SSScolllable>
  );
}

function RewardWinsCountPie({ data }: RewardWinsCountPieProps) {
  return (
    <Pie
      data={{
        labels: Object.keys(data),
        datasets: [{ data: Object.values(data) }],
      }}
    />
  );
}

function RewardWinsTrendLine({ data }: RewardWinsTrendLineProps) {
  return (
    <Line
      data={{
        labels: Object.keys(data),
        datasets: [
          {
            data: Object.values(data),
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
          legend: {
            display: false,
          },
        },
      }}
    />
  );
}

export default function LotteryAnalyzer() {
  useEffect(() => {
    handlePerPrizeAnalayzeDataFetch();
    handleRewardWinsCountDataFetch();
    handleRewardWinsTrendDataFetch();
  }, []);

  useEffect(
    () => handlePerPrizeAnalayzeDataFetch(),
    [perPrizeAnalyzeTimeRange.value]
  );

  useEffect(() => {
    RewardWinsCountData.value = undefined;
    handleRewardWinsCountDataFetch();
  }, [RewardWinsCountPieTimeRange.value]);

  useEffect(() => {
    RewardWinsTrendData.value = undefined;
    handleRewardWinsTrendDataFetch();
  }, [RewardWinsTrendLineTimeRange.value]);

  return (
    <div className="flex flex-col gap-4">
      <SSText xlarge xbold>
        综合统计
      </SSText>
      <div className="grid place-content-center">
        <SSSegmentedControl
          label=""
          value={perPrizeAnalyzeTimeRange}
          data={timeRangeSCData}
        />
      </div>
      {typeof perPrizeAnalyzeData.value !== "undefined" ? (
        <PerPrizeAnalyzeTable data={perPrizeAnalyzeData.value} />
      ) : (
        <SSSkeleton className="h-[291px]" />
      )}
      <SSTooltip tooltip="受简书接口限制，我们无法获取这两种奖品的中奖情况，故表中未予统计">
        关于免费开 1 次连载 / 锦鲤头像框
      </SSTooltip>

      <SSText xlarge xbold>
        中奖次数分布
      </SSText>
      <div className="grid place-content-center">
        <SSSegmentedControl
          label=""
          value={RewardWinsCountPieTimeRange}
          data={timeRangeSCData}
        />
      </div>
      <ChartWrapper
        chartType="pie"
        show={typeof RewardWinsCountData.value !== "undefined"}
      >
        <RewardWinsCountPie data={RewardWinsCountData.value!} />
      </ChartWrapper>

      <SSText xlarge xbold>
        中奖次数趋势
      </SSText>
      <div className="grid place-content-center">
        <SSSegmentedControl
          label=""
          value={RewardWinsTrendLineTimeRange}
          data={timeRangeWithoutAllSCData}
        />
      </div>
      <ChartWrapper
        chartType="radial"
        show={typeof RewardWinsTrendData.value !== "undefined"}
      >
        <RewardWinsTrendLine data={RewardWinsTrendData.value!} />
      </ChartWrapper>
    </div>
  );
}
