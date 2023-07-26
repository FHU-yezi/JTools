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
import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";
import { Line, Pie } from "react-chartjs-2";
import ChartWrapper from "../components/ChartWrapper";
import SSSegmentedControl from "../components/SSSegmentedControl";
import SSSkeleton from "../components/SSSkeleton";
import SSTable from "../components/SSTable";
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
const perPrizeAnalyzeData = signal<PerPrizeDataItem[] | undefined>(undefined);
const rewardWinsCountPieTimeRange = signal<TimeRange>("1d");
const rewardWinsCountData = signal<RewardsWinsCountDataItem | undefined>(
  undefined
);
const rewardWinsTrendLineTimeRange = signal<TimeRangeWithoutAll>("1d");
const rewardWinsTrendData = signal<RewardWinsTrendDataItem | undefined>(
  undefined
);

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
        time_range: rewardWinsCountPieTimeRange.value,
      },
      (data) => (rewardWinsCountData.value = data.wins_count_data),
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
        time_range: rewardWinsTrendLineTimeRange.value,
      },
      (data) => (rewardWinsTrendData.value = data.trend_data),
      commonAPIErrorHandler
    );
  } catch {}
}

function PerPrizeAnalyzeTable() {
  const totalWins = perPrizeAnalyzeData.value!.reduce(
    (a, b) => a + b.wins_count,
    0
  );
  const totalWinners = perPrizeAnalyzeData.value!.reduce(
    (a, b) => a + b.winners_count,
    0
  );
  const totalAvagaeWinsCountPerWinner = totalWins / totalWinners;

  return (
    <SSTable
      className="min-w-[670px]"
      data={perPrizeAnalyzeData
        .value!.map<Record<string, ComponentChildren>>((item) => ({
          奖品名称: item.reward_name,
          中奖次数: item.wins_count,
          中奖人数: item.winners_count,
          平均每人中奖次数: item.average_wins_count_per_winner,
          中奖率: RoundFloat(item.winning_rate * 100, 3),
          稀有度: item.rarity,
        }))
        .concat(
          perPrizeAnalyzeData.value!.length !== 0
            ? [
                {
                  奖品名称: "总计",
                  中奖次数: totalWins,
                  中奖人数: totalWinners,
                  平均每人中奖次数: RoundFloat(
                    totalAvagaeWinsCountPerWinner,
                    3
                  ),
                  中奖率: undefined,
                  稀有度: undefined,
                },
              ]
            : []
        )}
      tableItemKey="reward_name"
    />
  );
}

function RewardWinsCountPie() {
  return (
    <Pie
      data={{
        labels: Object.keys(rewardWinsCountData.value!),
        datasets: [{ data: Object.values(rewardWinsCountData.value!) }],
      }}
    />
  );
}

function RewardWinsTrendLine() {
  return (
    <Line
      data={{
        labels: Object.keys(rewardWinsTrendData.value!),
        datasets: [
          {
            data: Object.values(rewardWinsTrendData.value!),
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
    rewardWinsCountData.value = undefined;
    handleRewardWinsCountDataFetch();
  }, [rewardWinsCountPieTimeRange.value]);

  useEffect(() => {
    rewardWinsTrendData.value = undefined;
    handleRewardWinsTrendDataFetch();
  }, [rewardWinsTrendLineTimeRange.value]);

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
        <PerPrizeAnalyzeTable />
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
          value={rewardWinsCountPieTimeRange}
          data={timeRangeSCData}
        />
      </div>
      <ChartWrapper
        chartType="pie"
        show={typeof rewardWinsCountData.value !== "undefined"}
      >
        <RewardWinsCountPie />
      </ChartWrapper>

      <SSText xlarge xbold>
        中奖次数趋势
      </SSText>
      <div className="grid place-content-center">
        <SSSegmentedControl
          label=""
          value={rewardWinsTrendLineTimeRange}
          data={timeRangeWithoutAllSCData}
        />
      </div>
      <ChartWrapper
        chartType="radial"
        show={typeof rewardWinsTrendData.value !== "undefined"}
      >
        <RewardWinsTrendLine />
      </ChartWrapper>
    </div>
  );
}
