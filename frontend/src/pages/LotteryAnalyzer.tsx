import { signal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  LargeText,
  LoadingArea,
  Row,
  Select,
  SmallText,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@sscreator/ui";
import { useEffect } from "preact/hooks";
import SSLineChart from "../components/charts/SSLineChart";
import type {
  GetRecordsItem,
  GetRecordsRequest,
  GetRecordsResponse,
  GetRewardWinsHistoryRequest,
  GetRewardWinsHistoryResponse,
  GetSummaryRequest,
  GetSummaryResponse,
  GetSummaryRewardItem,
} from "../models/lottery";
import { roundFloat } from "../utils/numberHelper";
import { sendRequest } from "../utils/sendRequest";
import { parseTime } from "../utils/timeHelper";

const summaryTimeRangeSwitchData = [
  { label: "1 天", value: "1d" },
  { label: "7 天", value: "7d" },
  { label: "30 天", value: "30d" },
  { label: "全部", value: "all" },
];
const rewardWinsHistoryTimeRangeSwitchData = [
  { label: "1 天", value: "1d" },
  { label: "30 天", value: "30d" },
  { label: "60 天", value: "60d" },
];

type SummaryTimeRangeType = "1d" | "7d" | "30d" | "all";
type RewardWinsHistoryTimeRangeType = "1d" | "30d" | "60d";

const summaryTimeRange = signal<SummaryTimeRangeType>("1d");
const summaryResult = signal<GetSummaryRewardItem[] | undefined>(undefined);
const rewardWinsHistoryTimeRange = signal<RewardWinsHistoryTimeRangeType>("1d");
const rewardWinsHistoryResult = signal<Record<number, number> | undefined>(
  undefined,
);
const recentRecords = signal<GetRecordsItem[] | undefined>(undefined);

const isRewardWinsHistoryTimeRangeSelectDropdownOpened = signal(false);
const isSummaryTimeRangeSelectDropdownOpened = signal(false);

function handleSummaryFetch() {
  sendRequest<GetSummaryRequest, GetSummaryResponse>({
    method: "GET",
    endpoint: "/v1/lottery/summary",
    queryArgs: {
      range: summaryTimeRange.value,
    },
    onSuccess: ({ data }) => (summaryResult.value = data.rewards),
  });
}

function handleRewardWinsHistoryFetch() {
  sendRequest<GetRewardWinsHistoryRequest, GetRewardWinsHistoryResponse>({
    method: "GET",
    endpoint: "/v1/lottery/reward-wins-history",
    queryArgs: {
      range: rewardWinsHistoryTimeRange.value,
      resolution: rewardWinsHistoryTimeRange.value === "1d" ? "1h" : "1d",
    },
    onSuccess: ({ data }) => (rewardWinsHistoryResult.value = data.history),
  });
}

function handleRecentRecordsFetch() {
  sendRequest<GetRecordsRequest, GetRecordsResponse>({
    method: "GET",
    endpoint: "/v1/lottery/records",
    queryArgs: {
      limit: 5,
      excluded_awards: ["收益加成卡100"],
    },
    onSuccess: ({ data }) => (recentRecords.value = data.records),
  });
}

function PerPrizeAnalyzeTable() {
  const totalWins = summaryResult.value!.reduce((a, b) => a + b.winsCount, 0);
  const totalWinners = summaryResult.value!.reduce(
    (a, b) => a + b.winnersCount,
    0,
  );
  const totalAvagaeWinsCountPerWinner = totalWins / totalWinners;

  return (
    <Table className="min-w-xl w-full whitespace-nowrap text-center">
      <TableHeader>
        <TableHead>奖品名称</TableHead>
        <TableHead>中奖次数</TableHead>
        <TableHead>中奖人数</TableHead>
        <TableHead>平均每人中奖次数</TableHead>
        <TableHead>中奖率</TableHead>
        <TableHead>稀有度</TableHead>
      </TableHeader>
      <TableBody>
        {summaryResult.value!.map((item) => (
          <TableRow>
            <TableCell>{item.rewardName}</TableCell>
            <TableCell>{item.winsCount}</TableCell>
            <TableCell>{item.winnersCount}</TableCell>
            <TableCell>
              {item.winsCount !== 0 ? item.averageWinsCountPerWinner : "---"}
            </TableCell>
            <TableCell>
              {item.winsCount !== 0
                ? `${roundFloat(item.winningRate * 100, 2)}%`
                : "---"}
            </TableCell>
            <TableCell>{item.winsCount !== 0 ? item.rarity : "---"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>总计</TableCell>
          <TableCell>{totalWins}</TableCell>
          <TableCell>{totalWinners}</TableCell>
          <TableCell>
            {totalWins !== 0
              ? roundFloat(totalAvagaeWinsCountPerWinner, 3)
              : "---"}
          </TableCell>
          <TableCell colSpan={2}> </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

function RecordItem({ data }: { data: GetRecordsItem }) {
  return (
    <div className="border-b border-gray-300 px-4 py-2 dark:border-gray-500 last:border-none">
      <Row className="justify-between" itemsCenter>
        <Column gap="gap-0">
          <ExternalLink href={data.userUrl}>{data.userName}</ExternalLink>
          <Text colorScheme="gray">
            {parseTime(data.time).format("MM-DD HH:mm")}
          </Text>
        </Column>
        <LargeText bold>{data.rewardName}</LargeText>
      </Row>
    </div>
  );
}

function RecentRecordsBlock() {
  return (
    <>
      <LargeText bold>近期大奖</LargeText>
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

function RewardWinsHistoryBlock() {
  return (
    <>
      <LargeText bold>中奖次数趋势</LargeText>
      <Select
        id="reward-wins-history-time-range"
        isDropdownOpened={isRewardWinsHistoryTimeRangeSelectDropdownOpened}
        value={rewardWinsHistoryTimeRange}
        options={rewardWinsHistoryTimeRangeSwitchData}
      />
      <SSLineChart
        className="h-72 max-w-lg w-full"
        dataReady={rewardWinsHistoryResult.value !== undefined}
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
                rewardWinsHistoryResult.value === undefined
                  ? undefined
                  : Object.entries(rewardWinsHistoryResult.value),
            },
          ],
          tooltip: {
            show: true,
            trigger: "axis",
          },
        }}
      />
    </>
  );
}

export default function LotteryAnalyzer() {
  useEffect(() => {
    handleSummaryFetch();
    handleRecentRecordsFetch();
    handleRewardWinsHistoryFetch();
  }, []);

  useEffect(() => handleSummaryFetch(), [summaryTimeRange.value]);

  useEffect(() => {
    rewardWinsHistoryResult.value = undefined;
    handleRewardWinsHistoryFetch();
  }, [rewardWinsHistoryTimeRange.value]);

  return (
    <Column>
      <LargeText bold>综合统计</LargeText>
      <Select
        id="summary-time-range"
        value={summaryTimeRange}
        isDropdownOpened={isSummaryTimeRangeSelectDropdownOpened}
        options={summaryTimeRangeSwitchData}
      />
      <LoadingArea
        className="h-[291px]"
        loading={summaryResult.value === undefined}
      >
        {summaryResult.value !== undefined && <PerPrizeAnalyzeTable />}
      </LoadingArea>
      <SmallText colorScheme="gray">
        受简书接口限制，本工具数据不包括免费开 1 次连载与锦鲤头像框
      </SmallText>

      <RecentRecordsBlock />
      <RewardWinsHistoryBlock />
    </Column>
  );
}
