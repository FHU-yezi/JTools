import { useSignal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  Grid,
  Heading2,
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
import LineChart from "../components/charts/LineChart";
import {
  useRecords,
  useRewardWinsHistory,
  useSummary,
  type GetSummaryResponse,
} from "../api/lottery";
import { Datetime } from "../utils/timeHelper";

function SummaryTable({ data }: { data: GetSummaryResponse }) {
  const totalWins = data.rewards.reduce((a, b) => a + b.winsCount, 0);
  const totalWinners = data.rewards.reduce((a, b) => a + b.winnersCount, 0);
  const totalAvagaeWinsCountPerWinner = totalWins / totalWinners;

  return (
    <Table className="min-w-xl w-full whitespace-nowrap text-center">
      <TableHeader>
        <TableRow>
          <TableHead>奖品名称</TableHead>
          <TableHead>中奖次数</TableHead>
          <TableHead>中奖人数</TableHead>
          <TableHead>平均每人中奖次数</TableHead>
          <TableHead>中奖率</TableHead>
          <TableHead>稀有度</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.rewards.map((item) => (
          <TableRow key={item.rewardName}>
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
  const { data: summaryData } = useSummary({
    range: timeRange.value,
  });

  return (
    <Column>
      <Heading2>综合统计</Heading2>
      <Select
        id="summary-time-range"
        value={timeRange}
        options={tiameRangeOptions}
        fullWidth
      />
      <LoadingArea className="h-[198px]" loading={!summaryData}>
        {summaryData && <SummaryTable data={summaryData} />}
      </LoadingArea>
      <SmallText color="gray">
        受简书接口限制，免费开 1 次连载与锦鲤头像框未予统计
      </SmallText>
    </Column>
  );
}

function RecentWins() {
  const { data: recentRecords } = useRecords({
    limit: 5,
    excluded_awards: ["收益加成卡100"],
  });

  return (
    <Column>
      <Heading2>近期大奖</Heading2>
      <LoadingArea className="h-[320px]" loading={!recentRecords}>
        {recentRecords && (
          <Column gap="gap-0">
            {recentRecords.records.map((item) => (
              <Row
                key={item.time}
                className="justify-between border-zinc-300 p-2 not-last:border-b dark:border-zinc-700"
                gap="gap-0"
                itemsCenter
              >
                <Column gap="gap-1">
                  <ExternalLink href={item.userUrl}>
                    {item.userName}
                  </ExternalLink>
                  <SmallText color="gray">
                    {new Datetime(item.time).humanReadableTimedelta}
                  </SmallText>
                </Column>
                <LargeText bold>{item.rewardName}</LargeText>
              </Row>
            ))}
          </Column>
        )}
      </LoadingArea>
    </Column>
  );
}

function WinsTrending() {
  const tiameRangeOptions = [
    { label: "24 小时", value: "1d" },
    { label: "30 天", value: "30d" },
    { label: "60 天", value: "60d" },
  ];

  const timeRange = useSignal<"1d" | "30d" | "60d">("1d");
  const { data: rewardWinsHistory } = useRewardWinsHistory({
    range: timeRange.value,
    resolution: timeRange.value === "1d" ? "1h" : "1d",
  });

  return (
    <Column>
      <Row className="justify-between" itemsCenter>
        <Heading2>中奖趋势</Heading2>
        <Select
          id="wins-trending-time-range"
          value={timeRange}
          options={tiameRangeOptions}
          fullWidth
        />
      </Row>
      <LineChart
        className="h-72 max-w-lg w-full"
        loading={!rewardWinsHistory}
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
              data: rewardWinsHistory
                ? Object.entries(rewardWinsHistory.history)
                : undefined,
            },
          ],
          tooltip: {
            show: true,
            trigger: "axis",
          },
        }}
      />
    </Column>
  );
}

export default function LotteryAnalyzer() {
  return (
    <>
      <Summary />

      <Grid cols="grid-cols-1 lg:grid-cols-2" gap="gap-8">
        <RecentWins />
        <WinsTrending />
      </Grid>
    </>
  );
}
