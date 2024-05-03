import { computed, useSignal } from "@preact/signals";
import {
  Column,
  Grid,
  Heading2,
  Heading3,
  LargeText,
  Notice,
  Row,
  Select,
  SmallText,
  Text,
} from "@sscreator/ui";
import { LoaderIcon } from "react-hot-toast";
import BarChart from "../components/charts/BarChart";
import LineChart from "../components/charts/LineChart";
import {
  useAmountHistory,
  useCurrentAmount,
  useCurrentAmountDistribution,
  useCurrentPrice,
  usePriceHistory,
  useRules,
} from "../api/JPEPFTNMacket";

const timeRangeOptions = [
  { label: "24 小时", value: "24h" },
  { label: "7 天", value: "7d" },
  { label: "15 天", value: "15d" },
  { label: "30 天", value: "30d" },
];

type TimeRangeType = "24h" | "7d" | "15d" | "30d";

function PlatformInfo() {
  const { data: platformRules } = useRules();

  return (
    <Column>
      <Heading2>平台信息</Heading2>
      {platformRules && !platformRules.isOpen && (
        <Notice color="warning" title="平台休市中" />
      )}
      <Row className="justify-around">
        <Column gap="gap-1">
          <Text color="gray">贝交易手续费</Text>
          {platformRules ? (
            <LargeText bold>{platformRules.FTNOrderFee * 100}%</LargeText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <LargeText color="gray">获取中</LargeText>
            </Row>
          )}
        </Column>
        <Column gap="gap-1">
          <Text color="gray">商品交易手续费</Text>
          {platformRules ? (
            <LargeText bold>{platformRules.goodsOrderFee * 100}%</LargeText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <LargeText color="gray">获取中</LargeText>
            </Row>
          )}
        </Column>
      </Row>
    </Column>
  );
}

function RealtimePrice() {
  const { data: platformRules } = useRules();
  const { data: currentPrice } = useCurrentPrice();

  return (
    <Column gap="gap-2">
      <Heading3>价格</Heading3>
      <Row className="justify-around">
        <Column gap="gap-1">
          <Text color="gray">买贝</Text>
          {currentPrice ? (
            <LargeText bold>{currentPrice.buyPrice}</LargeText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <LargeText color="gray">获取中</LargeText>
            </Row>
          )}
          {platformRules ? (
            <SmallText color="gray">
              限价：{platformRules.buyOrderMinimumPrice}
            </SmallText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <SmallText color="gray">获取中</SmallText>
            </Row>
          )}
        </Column>
        <Column gap="gap-1">
          <Text color="gray">卖贝</Text>
          {currentPrice ? (
            <LargeText bold>{currentPrice.sellPrice}</LargeText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <LargeText color="gray">获取中</LargeText>
            </Row>
          )}
          {platformRules ? (
            <SmallText color="gray">
              限价：{platformRules.sellOrderMinimumPrice}
            </SmallText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <SmallText color="gray">获取中</SmallText>
            </Row>
          )}
        </Column>
      </Row>
    </Column>
  );
}

function RealtimeAmount() {
  const { data: currentAmount } = useCurrentAmount();
  const totalPoolAmount = computed(() =>
    currentAmount
      ? currentAmount.buyAmount + currentAmount.sellAmount
      : undefined,
  );

  return (
    <Column gap="gap-2">
      <Heading3>挂单量</Heading3>
      <Row className="justify-around">
        <Column gap="gap-1">
          <Text color="gray">买贝</Text>
          {currentAmount ? (
            <LargeText bold>{currentAmount.buyAmount}</LargeText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <LargeText color="gray">获取中</LargeText>
            </Row>
          )}
          {currentAmount && totalPoolAmount.value ? (
            <SmallText color="gray">
              占比：
              {(
                (currentAmount.buyAmount / totalPoolAmount.value) *
                100
              ).toFixed(2)}
              %
            </SmallText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <SmallText color="gray">获取中</SmallText>
            </Row>
          )}
        </Column>
        <Column gap="gap-1">
          <Text color="gray">卖贝</Text>
          {currentAmount ? (
            <LargeText bold>{currentAmount.sellAmount}</LargeText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <LargeText color="gray">获取中</LargeText>
            </Row>
          )}
          {currentAmount && totalPoolAmount.value ? (
            <SmallText color="gray">
              占比：
              {(
                (currentAmount.sellAmount / totalPoolAmount.value) *
                100
              ).toFixed(2)}
              %
            </SmallText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <SmallText color="gray">获取中</SmallText>
            </Row>
          )}
        </Column>
      </Row>
    </Column>
  );
}

function RealtimeAmountDistribution() {
  const tradeTypeOptions = [
    { label: "买单", value: "buy" },
    { label: "卖单", value: "sell" },
  ];

  const tradeType = useSignal<"buy" | "sell">("buy");
  const { data: amountDistribution } = useCurrentAmountDistribution({
    type: tradeType.value,
  });

  return (
    <Column gap="gap-2">
      <Heading3>挂单价格分布</Heading3>
      <Select
        id="amount-distribution-trade-type"
        value={tradeType}
        options={tradeTypeOptions}
        fullWidth
      />
      <BarChart
        className="h-72 max-w-xl w-full"
        loading={!amountDistribution}
        options={{
          xAxis: {
            type: "category",
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              type: "bar",
              data: !amountDistribution
                ? undefined
                : Object.entries(amountDistribution.amountDistribution),
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

function RealtimeData() {
  return (
    <Column>
      <Heading2>实时数据</Heading2>

      <Grid cols="grid-cols-1 sm:grid-cols-2">
        <RealtimePrice />
        <RealtimeAmount />
      </Grid>

      <RealtimeAmountDistribution />
    </Column>
  );
}

function PriceHistory() {
  const timeRange = useSignal<TimeRangeType>("24h");
  const { data: buyPriceTrending } = usePriceHistory({
    type: "buy",
    range: timeRange.value,
    resolution: timeRange.value === "24h" ? "5m" : "1d",
  });
  const { data: sellPriceTrending } = usePriceHistory({
    type: "sell",
    range: timeRange.value,
    resolution: timeRange.value === "24h" ? "5m" : "1d",
  });

  return (
    <Column gap="gap-2">
      <Heading2>贝价趋势</Heading2>
      <Select
        id="price-trending-time-range"
        value={timeRange}
        options={timeRangeOptions}
        fullWidth
      />
      <LineChart
        className="h-72 max-w-lg w-full"
        loading={!buyPriceTrending || !sellPriceTrending}
        options={{
          xAxis: {
            type: "time",
          },
          yAxis: {
            type: "value",
            min: (value) => (value.min - 0.005).toFixed(3),
            max: (value) => (value.max + 0.005).toFixed(3),
          },
          series: [
            {
              type: "line",
              name: "买贝（左侧）",
              smooth: true,
              data: !buyPriceTrending
                ? undefined
                : Object.entries(buyPriceTrending.history),
              color: "#3b82f6",
            },
            {
              type: "line",
              name: "卖贝（右侧）",
              smooth: true,
              data: !sellPriceTrending
                ? undefined
                : Object.entries(sellPriceTrending.history),
              color: "#a855f7",
            },
          ],
          legend: {
            show: true,
          },
          tooltip: {
            show: true,
            trigger: "axis",
          },
        }}
      />
    </Column>
  );
}

function AmountHistory() {
  const timeRange = useSignal<TimeRangeType>("24h");
  const { data: buyAmountTrending } = useAmountHistory({
    type: "buy",
    range: timeRange.value,
    resolution: timeRange.value === "24h" ? "5m" : "1d",
  });
  const { data: sellAmountTrending } = useAmountHistory({
    type: "sell",
    range: timeRange.value,
    resolution: timeRange.value === "24h" ? "5m" : "1d",
  });

  return (
    <Column gap="gap-2">
      <Heading2>挂单量趋势</Heading2>
      <Select
        id="amount-trending-time-range"
        value={timeRange}
        options={timeRangeOptions}
        fullWidth
      />
      <LineChart
        className="h-72 max-w-lg w-full"
        loading={!buyAmountTrending || !sellAmountTrending}
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
              name: "买贝（左侧）",
              smooth: true,
              data: !buyAmountTrending
                ? undefined
                : Object.entries(buyAmountTrending.history),
              color: "#3b82f6",
            },
            {
              type: "line",
              name: "卖贝（右侧）",
              smooth: true,
              data: !sellAmountTrending
                ? undefined
                : Object.entries(sellAmountTrending.history),
              color: "#a855f7",
            },
          ],
          legend: {
            show: true,
          },
          tooltip: {
            show: true,
            trigger: "axis",
          },
        }}
      />
    </Column>
  );
}

export default function JPEPFTNMarketAnalyzer() {
  return (
    <>
      <PlatformInfo />
      <RealtimeData />

      <Grid cols="grid-cols-1 lg:grid-cols-2" gap="gap-8">
        <PriceHistory />
        <AmountHistory />
      </Grid>
    </>
  );
}
