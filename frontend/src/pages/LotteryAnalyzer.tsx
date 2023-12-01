import { signal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  LoadingArea,
  Row,
  Switch,
  Text,
  Tooltip,
} from "@sscreator/ui";
import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";
import SSTable from "../components/SSTable";
import SSLineChart from "../components/charts/SSLineChart";
import type {
  GetRecordsItem,
  GetRecordsRequest,
  GetRecordsResponse,
  GetRewardWinsHistoryRequest,
  GetRewardWinsHistoryResponse,
  GetRewardsResponse,
  GetSummaryRequest,
  GetSummaryResponse,
  GetSummaryRewardItem,
} from "../models/lottery";
import { roundFloat } from "../utils/numberHelper";
import { sendRequest } from "../utils/sendRequest";
import { parseTime } from "../utils/timeHelper";

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

type TimeRange = "1d" | "7d" | "30d" | "all";
type TimeRangeWithoutAll = "1d" | "7d" | "30d";

const rewards = signal<string[] | undefined>(undefined);
const perPrizeAnalyzeTimeRange = signal<TimeRange>("1d");
const perPrizeAnalyzeData = signal<GetSummaryRewardItem[] | undefined>(
  undefined,
);
const rewardWinsTrendLineTimeRange = signal<TimeRangeWithoutAll>("1d");
const rewardWinsTrendData = signal<Record<number, number> | undefined>(
  undefined,
);
const recentRecords = signal<GetRecordsItem[] | undefined>(undefined);

function handleSummaryFetch() {
  sendRequest<GetSummaryRequest, GetSummaryResponse>({
    method: "GET",
    endpoint: "/v1/lottery/summary",
    queryArgs: {
      range: perPrizeAnalyzeTimeRange.value,
    },
    onSuccess: ({ data }) => (perPrizeAnalyzeData.value = data.rewards),
  });
}

function handleRewardWinsHistoryFetch() {
  sendRequest<GetRewardWinsHistoryRequest, GetRewardWinsHistoryResponse>({
    method: "GET",
    endpoint: "/v1/lottery/reward-wins-history",
    queryArgs: {
      range: rewardWinsTrendLineTimeRange.value,
      resolution: rewardWinsTrendLineTimeRange.value === "1d" ? "1h" : "1d",
    },
    onSuccess: ({ data }) => (rewardWinsTrendData.value = data.history),
  });
}

function handleRecentRecordsFetch() {
  sendRequest<Record<string, never>, GetRewardsResponse>({
    method: "GET",
    endpoint: "/v1/lottery/rewards",
    onSuccess: ({ data: rewardsData }) => {
      rewards.value = rewardsData.rewards;

      sendRequest<GetRecordsRequest, GetRecordsResponse>({
        method: "GET",
        endpoint: "/v1/lottery/records",
        queryArgs: {
          limit: 5,
          target_rewards: rewards.value!.filter((x) => x !== "收益加成卡100"),
        },
        onSuccess: ({ data }) => (recentRecords.value = data.records),
      });
    },
  });
}

function PerPrizeAnalyzeTable() {
  const totalWins = perPrizeAnalyzeData.value!.reduce(
    (a, b) => a + b.winsCount,
    0,
  );
  const totalWinners = perPrizeAnalyzeData.value!.reduce(
    (a, b) => a + b.winnersCount,
    0,
  );
  const totalAvagaeWinsCountPerWinner = totalWins / totalWinners;

  return (
    <SSTable
      className="min-w-[670px]"
      data={perPrizeAnalyzeData
        .value!.map<Record<string, ComponentChildren>>((item) => ({
          奖品名称: <Text center>{item.rewardName}</Text>,
          中奖次数: <Text center>{item.winsCount}</Text>,
          中奖人数: <Text center>{item.winnersCount}</Text>,
          平均每人中奖次数: (
            <Text center>
              {item.winsCount !== 0 ? item.averageWinsCountPerWinner : "---"}
            </Text>
          ),
          中奖率: (
            <Text center>
              {item.winsCount !== 0
                ? `${roundFloat(item.winningRate * 100, 2)}%`
                : "---"}
            </Text>
          ),
          稀有度: (
            <Text center>{item.winsCount !== 0 ? item.rarity : "---"}</Text>
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
                      {roundFloat(totalAvagaeWinsCountPerWinner, 3)}
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

function RecordItem({ data }: { data: GetRecordsItem }) {
  return (
    <div className="border-b border-gray-300 px-4 py-2 dark:border-gray-500 last:border-none">
      <Row className="justify-between" verticalCenter>
        <Column gap="gap-0">
          <ExternalLink href={data.userUrl}>{data.userName}</ExternalLink>
          <Text gray>{parseTime(data.time).format("MM-DD HH:mm")}</Text>
        </Column>
        <Text large bold>
          {data.rewardName}
        </Text>
      </Row>
    </div>
  );
}

function RecentRecordsBlock() {
  return (
    <>
      <Text large bold>
        近期大奖
      </Text>
      <LoadingArea
        className="h-[320px]"
        loading={recentRecords.value === undefined}
      >
        <Column gap="gap-0">
          {recentRecords.value !== undefined &&
            recentRecords.value.map((item) => <RecordItem data={item} />)}
        </Column>
      </LoadingArea>
    </>
  );
}

function RewardWinsTrendLine() {
  return (
    <SSLineChart
      className="h-72 max-w-lg w-full"
      dataReady={rewardWinsTrendData.value !== undefined}
      options={{
        xAxis: {
          type: "time",
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
                : Object.entries(rewardWinsTrendData.value),
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
    handleSummaryFetch();
    handleRewardWinsHistoryFetch();
    handleRecentRecordsFetch();
  }, []);

  useEffect(() => handleSummaryFetch(), [perPrizeAnalyzeTimeRange.value]);

  useEffect(() => {
    rewardWinsTrendData.value = undefined;
    handleRewardWinsHistoryFetch();
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

      <RecentRecordsBlock />

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
