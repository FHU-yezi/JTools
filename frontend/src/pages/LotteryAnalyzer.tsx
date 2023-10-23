import { signal } from "@preact/signals";
import { Column, LoadingArea, Switch, Text, Tooltip } from "@sscreator/ui";
import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";
import SSTable from "../components/SSTable";
import SSLineChart from "../components/charts/SSLineChart";
import SSPieChart from "../components/charts/SSPieChart";
import type {
  PerPrizeDataItem,
  PerPrizeDataRequest,
  PerPrizeDataResponse,
} from "../models/LotteryAnalyzer/PerPrizeData";
import type {
  RewardsWinsCountDataItem,
  RewardsWinsCountDataRequest,
  RewardsWinsCountDataResponse,
} from "../models/LotteryAnalyzer/RewardWinsCountData";
import type {
  RewardWinsTrendDataItem,
  RewardWinsTrendDataRequest,
  RewardsWinsTrendDataResponse,
} from "../models/LotteryAnalyzer/RewardWinsTrendData";
import type {
  TimeRange,
  TimeRangeWithoutAll,
} from "../models/LotteryAnalyzer/base";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { RoundFloat } from "../utils/numberHelper";

const timeRangeSwitchData = [
  { label: "1 天", value: "1d" },
  { label: "7 天", value: "7d" },
  { label: "30 天", value: "30d" },
  { label: "全部", value: "all" },
];
const timeRangeWithoutAllSwitchData = [
  { label: "1 天", value: "1d" },
  { label: "7 天", value: "7d" },
  { label: "30 天", value: "30d" },
];

const perPrizeAnalyzeTimeRange = signal<TimeRange>("1d");
const perPrizeAnalyzeData = signal<PerPrizeDataItem[] | undefined>(undefined);
const rewardWinsCountPieTimeRange = signal<TimeRange>("1d");
const rewardWinsCountData = signal<RewardsWinsCountDataItem | undefined>(
  undefined,
);
const rewardWinsTrendLineTimeRange = signal<TimeRangeWithoutAll>("1d");
const rewardWinsTrendData = signal<RewardWinsTrendDataItem | undefined>(
  undefined,
);

function handlePerPrizeAnalayzeDataFetch() {
  fetchData<PerPrizeDataRequest, PerPrizeDataResponse>(
    "GET",
    "/tools/lottery_analyzer/per_prize_data",
    {
      time_range: perPrizeAnalyzeTimeRange.value,
    },
    (data) => (perPrizeAnalyzeData.value = data.rewards),
    commonAPIErrorHandler,
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
    commonAPIErrorHandler,
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
    commonAPIErrorHandler,
  );
}

function PerPrizeAnalyzeTable() {
  const totalWins = perPrizeAnalyzeData.value!.reduce(
    (a, b) => a + b.wins_count,
    0,
  );
  const totalWinners = perPrizeAnalyzeData.value!.reduce(
    (a, b) => a + b.winners_count,
    0,
  );
  const totalAvagaeWinsCountPerWinner = totalWins / totalWinners;

  return (
    <SSTable
      className="min-w-[670px]"
      data={perPrizeAnalyzeData
        .value!.map<Record<string, ComponentChildren>>((item) => ({
          奖品名称: <Text center>{item.reward_name}</Text>,
          中奖次数: <Text center>{item.wins_count}</Text>,
          中奖人数: <Text center>{item.winners_count}</Text>,
          平均每人中奖次数: (
            <Text center>
              {item.wins_count !== 0
                ? item.average_wins_count_per_winner
                : "---"}
            </Text>
          ),
          中奖率: (
            <Text center>
              {item.wins_count !== 0
                ? `${RoundFloat(item.winning_rate * 100, 2)}%`
                : "---"}
            </Text>
          ),
          稀有度: (
            <Text center>{item.wins_count !== 0 ? item.rarity : "---"}</Text>
          ),
        }))
        .concat(
          perPrizeAnalyzeData.value!.length !== 0
            ? [
                {
                  奖品名称: (
                    <Text bold center>
                      总计
                    </Text>
                  ),
                  中奖次数: (
                    <Text bold center>
                      {totalWins}
                    </Text>
                  ),
                  中奖人数: (
                    <Text bold center>
                      {totalWinners}
                    </Text>
                  ),
                  平均每人中奖次数: (
                    <Text bold center>
                      {RoundFloat(totalAvagaeWinsCountPerWinner, 3)}
                    </Text>
                  ),
                  中奖率: undefined,
                  稀有度: undefined,
                },
              ]
            : [],
        )}
      tableItemKey="reward_name"
    />
  );
}

function RewardWinsCountPie() {
  return (
    <SSPieChart
      className="h-96 max-w-lg w-full"
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
                    ([name, value]) => ({ name, value }),
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
      className="h-72 max-w-lg w-full"
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
    [perPrizeAnalyzeTimeRange.value],
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
    <Column>
      <Text large bold>
        综合统计
      </Text>
      <Switch value={perPrizeAnalyzeTimeRange} data={timeRangeSwitchData} />
      <LoadingArea
        className="h-[291px]"
        loading={perPrizeAnalyzeData.value === undefined}
      >
        {perPrizeAnalyzeData.value !== undefined && <PerPrizeAnalyzeTable />}
      </LoadingArea>
      <Tooltip tooltip="受简书接口限制，我们无法获取这两种奖品的中奖情况，故表中未予统计">
        关于免费开 1 次连载 / 锦鲤头像框
      </Tooltip>

      <Text large bold>
        中奖次数分布
      </Text>
      <Switch value={rewardWinsCountPieTimeRange} data={timeRangeSwitchData} />
      <RewardWinsCountPie />

      <Text large bold>
        中奖次数趋势
      </Text>
      <Switch
        value={rewardWinsTrendLineTimeRange}
        data={timeRangeWithoutAllSwitchData}
      />
      <RewardWinsTrendLine />
    </Column>
  );
}
