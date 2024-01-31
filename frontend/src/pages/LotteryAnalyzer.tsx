import { useSignal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  Heading1,
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
} from "@sscreator/ui";
import { useEffect } from "preact/hooks";
import LineChart from "../components/charts/LineChart";
import type {
  GetRecordsRequest,
  GetRecordsResponse,
  GetRewardWinsHistoryRequest,
  GetRewardWinsHistoryResponse,
  GetSummaryRequest,
  GetSummaryResponse,
} from "../models/lottery";
import { sendRequest } from "../utils/sendRequest";
import { getHumanReadableTimeDelta, parseTime } from "../utils/timeHelper";

function SummaryTable({ data }: { data: GetSummaryResponse }) {
  const totalWins = data.rewards.reduce((a, b) => a + b.winsCount, 0);
  const totalWinners = data.rewards.reduce((a, b) => a + b.winnersCount, 0);
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
        {data.rewards.map((item) => (
          <TableRow>
            <TableCell>{item.rewardName}</TableCell>
            <TableCell>{item.winsCount}</TableCell>
            <TableCell>{item.winnersCount}</TableCell>
            <TableCell>
              {item.winsCount !== 0 ? item.averageWinsCountPerWinner : "---"}
            </TableCell>
            <TableCell>
              {item.winsCount !== 0
                ? `${(item.winningRate * 100).toFixed(2)}%`
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
            {totalWins !== 0 ? totalAvagaeWinsCountPerWinner.toFixed(3) : "---"}
          </TableCell>
          <TableCell colSpan={2}> </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

function Summary() {
  const tiameRangeOptions = [
    { label: "1 天", value: "1d" },
    { label: "7 天", value: "7d" },
    { label: "30 天", value: "30d" },
    { label: "全部", value: "all" },
  ];

  const timeRange = useSignal<"1d" | "7d" | "30d" | "all">("1d");
  const summaryData = useSignal<GetSummaryResponse | null>(null);

  useEffect(() => {
    sendRequest<GetSummaryRequest, GetSummaryResponse>({
      method: "GET",
      endpoint: "/v1/lottery/summary",
      queryArgs: {
        range: timeRange.value,
      },
      onSuccess: ({ data }) => (summaryData.value = data),
    });
  }, []);

  useEffect(() => {
    summaryData.value = null;
    sendRequest<GetSummaryRequest, GetSummaryResponse>({
      method: "GET",
      endpoint: "/v1/lottery/summary",
      queryArgs: {
        range: timeRange.value,
      },
      onSuccess: ({ data }) => (summaryData.value = data),
    });
  }, [timeRange.value]);

  return (
    <>
      <Heading1>综合统计</Heading1>
      <Select
        id="summary-time-range"
        value={timeRange}
        options={tiameRangeOptions}
        fullWidth
      />
      <LoadingArea className="h-[198px]" loading={!summaryData.value}>
        {summaryData.value && <SummaryTable data={summaryData.value} />}
      </LoadingArea>
      <SmallText colorScheme="gray">
        受简书接口限制，免费开 1 次连载与锦鲤头像框未予统计
      </SmallText>
    </>
  );
}

function RecentWins() {
  const recentRecords = useSignal<GetRecordsResponse | null>(null);

  useEffect(() => {
    sendRequest<GetRecordsRequest, GetRecordsResponse>({
      method: "GET",
      endpoint: "/v1/lottery/records",
      queryArgs: {
        limit: 5,
        excluded_awards: ["收益加成卡100"],
      },
      onSuccess: ({ data }) => (recentRecords.value = data),
    });
  }, []);

  return (
    <>
      <Heading1>近期大奖</Heading1>
      <LoadingArea className="h-[320px]" loading={!recentRecords.value}>
        {recentRecords.value && (
          <Column gap="gap-0">
            {recentRecords.value.records.map((item) => (
              <Row
                className="justify-between border-zinc-300 p-2 not-last:border-b dark:border-zinc-700"
                gap="gap-0"
                itemsCenter
              >
                <Column gap="gap-1">
                  <ExternalLink href={item.userUrl}>
                    {item.userName}
                  </ExternalLink>
                  <SmallText colorScheme="gray">
                    {getHumanReadableTimeDelta(parseTime(item.time))}
                  </SmallText>
                </Column>
                <LargeText bold>{item.rewardName}</LargeText>
              </Row>
            ))}
          </Column>
        )}
      </LoadingArea>
    </>
  );
}

function WinsTrend() {
  const tiameRangeOptions = [
    { label: "1 天", value: "1d" },
    { label: "30 天", value: "30d" },
    { label: "60 天", value: "60d" },
  ];

  const timeRange = useSignal<"1d" | "30d" | "60d">("1d");
  const rewardWinsHistory = useSignal<GetRewardWinsHistoryResponse | null>(
    null,
  );

  useEffect(() => {
    sendRequest<GetRewardWinsHistoryRequest, GetRewardWinsHistoryResponse>({
      method: "GET",
      endpoint: "/v1/lottery/reward-wins-history",
      queryArgs: {
        range: timeRange.value,
        resolution: timeRange.value === "1d" ? "1h" : "1d",
      },
      onSuccess: ({ data }) => (rewardWinsHistory.value = data),
    });
  }, []);

  useEffect(() => {
    rewardWinsHistory.value = null;
    sendRequest<GetRewardWinsHistoryRequest, GetRewardWinsHistoryResponse>({
      method: "GET",
      endpoint: "/v1/lottery/reward-wins-history",
      queryArgs: {
        range: timeRange.value,
        resolution: timeRange.value === "1d" ? "1h" : "1d",
      },
      onSuccess: ({ data }) => (rewardWinsHistory.value = data),
    });
  }, [timeRange.value]);

  return (
    <>
      <Heading1>中奖趋势</Heading1>
      <Select
        id="reward-wins-history-time-range"
        value={timeRange}
        options={tiameRangeOptions}
        fullWidth
      />
      <LineChart
        className="h-72 max-w-lg w-full"
        dataReady={!rewardWinsHistory.value}
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
              data: rewardWinsHistory.value
                ? Object.entries(rewardWinsHistory.value.history)
                : undefined,
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
  return (
    <Column>
      <Summary />
      <RecentWins />
      <WinsTrend />
    </Column>
  );
}
