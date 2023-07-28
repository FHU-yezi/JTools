import { signal } from "@preact/signals";
import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";
import SSCenter from "../components/SSCenter";
import SSSegmentedControl from "../components/SSSegmentedControl";
import SSSkeleton from "../components/SSSkeleton";
import SSTable from "../components/SSTable";
import SSText from "../components/SSText";
import SSTooltip from "../components/SSTooltip";
import SSLineChart from "../components/charts/SSLineChart";
import SSPieChart from "../components/charts/SSPieChart";
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
  fetchData<PerPrizeDataRequest, PerPrizeDataResponse>(
    "GET",
    "/tools/lottery_analyzer/per_prize_data",
    {
      time_range: perPrizeAnalyzeTimeRange.value,
    },
    (data) => (perPrizeAnalyzeData.value = data.rewards),
    commonAPIErrorHandler
  );
}

function handleRewardWinsCountDataFetch() {
  fetchData<RewardsWinsCountDataRequest, RewardsWinsCountDataResponse>(
    "GET",
    "/tools/lottery_analyzer/reward_wins_count_data",
    {
      time_range: rewardWinsCountPieTimeRange.value,
    },
    (data) => (rewardWinsCountData.value = data.wins_count_data),
    commonAPIErrorHandler
  );
}

function handleRewardWinsTrendDataFetch() {
  fetchData<RewardWinsTrendDataRequest, RewardsWinsTrendDataResponse>(
    "GET",
    "/tools/lottery_analyzer/reward_wins_trend_data",
    {
      time_range: rewardWinsTrendLineTimeRange.value,
    },
    (data) => (rewardWinsTrendData.value = data.trend_data),
    commonAPIErrorHandler
  );
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
          奖品名称: <SSText center>{item.reward_name}</SSText>,
          中奖次数: <SSText center>{item.wins_count}</SSText>,
          中奖人数: <SSText center>{item.winners_count}</SSText>,
          平均每人中奖次数: (
            <SSText center>
              {item.wins_count !== 0
                ? item.average_wins_count_per_winner
                : "---"}
            </SSText>
          ),
          中奖率: (
            <SSText center>
              {item.wins_count !== 0
                ? `${RoundFloat(item.winning_rate * 100, 2)}%`
                : "---"}
            </SSText>
          ),
          稀有度: (
            <SSText center>
              {item.wins_count !== 0 ? item.rarity : "---"}
            </SSText>
          ),
        }))
        .concat(
          perPrizeAnalyzeData.value!.length !== 0
            ? [
                {
                  奖品名称: (
                    <SSText bold center>
                      总计
                    </SSText>
                  ),
                  中奖次数: (
                    <SSText bold center>
                      {totalWins}
                    </SSText>
                  ),
                  中奖人数: (
                    <SSText bold center>
                      {totalWinners}
                    </SSText>
                  ),
                  平均每人中奖次数: (
                    <SSText bold center>
                      {RoundFloat(totalAvagaeWinsCountPerWinner, 3)}
                    </SSText>
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
    <SSPieChart
      className="h-96 w-full max-w-lg"
      dataReady={rewardWinsCountData.value !== undefined}
      options={{
        series: [
          {
            type: "pie",
            silent: true,
            radius: ["30%", "50%"],
            label: {
              overflow: "breakAll",
              formatter: "{b}：{c} 次 ({d}%)",
            },
            data:
              rewardWinsCountData.value === undefined
                ? undefined
                : Object.entries(rewardWinsCountData.value).map(
                    ([name, value]) => ({ name, value })
                  ),
          },
        ],
        legend: {
          show: true,
        },
      }}
    />
  );
}

function RewardWinsTrendLine() {
  return (
    <SSLineChart
      className="h-72 w-full max-w-lg"
      dataReady={rewardWinsTrendData.value !== undefined}
      options={{
        xAxis: {
          type: "category",
          data:
            rewardWinsTrendData.value === undefined
              ? undefined
              : Object.keys(rewardWinsTrendData.value),
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            type: "line",
            smooth: true,
            data:
              rewardWinsTrendData.value === undefined
                ? undefined
                : Object.values(rewardWinsTrendData.value),
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
      <SSCenter>
        <SSSegmentedControl
          label=""
          value={perPrizeAnalyzeTimeRange}
          data={timeRangeSCData}
        />
      </SSCenter>
      {perPrizeAnalyzeData.value !== undefined ? (
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
      <SSCenter>
        <SSSegmentedControl
          label=""
          value={rewardWinsCountPieTimeRange}
          data={timeRangeSCData}
        />
      </SSCenter>
      <RewardWinsCountPie />

      <SSText xlarge xbold>
        中奖次数趋势
      </SSText>
      <SSCenter>
        <SSSegmentedControl
          label=""
          value={rewardWinsTrendLineTimeRange}
          data={timeRangeWithoutAllSCData}
        />
      </SSCenter>
      <RewardWinsTrendLine />
    </div>
  );
}
