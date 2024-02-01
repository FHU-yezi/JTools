import { computed, useSignal } from "@preact/signals";
import {
  Column,
  Grid,
  Heading1,
  Heading2,
  LargeText,
  Notice,
  Row,
  Select,
  SmallText,
  Text,
} from "@sscreator/ui";
import { useEffect } from "preact/hooks";
import { LoaderIcon } from "react-hot-toast";
import BarChart from "../components/charts/BarChart";
import LineChart from "../components/charts/LineChart";
import type {
  GetAmountHistoryResponse,
  GetCurrentAmountDistributionRequest,
  GetCurrentAmountDistributionResponse,
  GetCurrentAmountResponse,
  GetCurrentPriceResponse,
  GetPriceHistoryRequest,
  GetPriceHistoryResponse,
  GetRulesResponse,
} from "../models/JPEPFTNMacket";
import { sendRequest } from "../utils/sendRequest";

const timeRangeSwitchData = [
  { label: "24 小时", value: "24h" },
  { label: "7 天", value: "7d" },
  { label: "15 天", value: "15d" },
  { label: "30 天", value: "30d" },
];

type TimeRangeType = "24h" | "7d" | "15d" | "30d";

function PlatformInfo() {
  const platformRules = useSignal<GetRulesResponse | null>(null);

  useEffect(() => {
    sendRequest<Record<string, never>, GetRulesResponse>({
      method: "GET",
      endpoint: "/v1/jpep/ftn-macket/rules",
      onSuccess: ({ data }) => (platformRules.value = data),
    });
  }, []);

  return (
    <Column>
      <Heading1>平台信息</Heading1>
      {platformRules.value && !platformRules.value.isOpen && (
        <Notice colorScheme="warning" title="平台休市中" />
      )}
      <Row className="justify-around">
        <Column gap="gap-1">
          <Text colorScheme="gray">贝交易手续费</Text>
          {platformRules.value ? (
            <LargeText bold>{platformRules.value.FTNOrderFee * 100}%</LargeText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <LargeText colorScheme="gray">获取中</LargeText>
            </Row>
          )}
        </Column>
        <Column gap="gap-1">
          <Text colorScheme="gray">商品交易手续费</Text>
          {platformRules.value ? (
            <LargeText bold>
              {platformRules.value.goodsOrderFee * 100}%
            </LargeText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <LargeText colorScheme="gray">获取中</LargeText>
            </Row>
          )}
        </Column>
      </Row>
    </Column>
  );
}

function RealtimePrice() {
  const platformRules = useSignal<GetRulesResponse | null>(null);
  const currentPrice = useSignal<GetCurrentPriceResponse | null>(null);

  useEffect(() => {
    sendRequest<Record<string, never>, GetRulesResponse>({
      method: "GET",
      endpoint: "/v1/jpep/ftn-macket/rules",
      onSuccess: ({ data }) => (platformRules.value = data),
    });
  }, []);

  useEffect(() => {
    sendRequest<Record<string, never>, GetCurrentPriceResponse>({
      method: "GET",
      endpoint: "/v1/jpep/ftn-macket/current-price",
      onSuccess: ({ data }) => (currentPrice.value = data),
    });
  }, []);

  return (
    <Column gap="gap-2">
      <Heading2>价格</Heading2>
      <Row className="justify-around">
        <Column gap="gap-1">
          <Text colorScheme="gray">买贝</Text>
          {currentPrice.value ? (
            <LargeText bold>{currentPrice.value.buyPrice}</LargeText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <LargeText colorScheme="gray">获取中</LargeText>
            </Row>
          )}
          {platformRules.value ? (
            <SmallText colorScheme="gray">
              限价：{platformRules.value.buyOrderMinimumPrice}
            </SmallText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <SmallText colorScheme="gray">获取中</SmallText>
            </Row>
          )}
        </Column>
        <Column gap="gap-1">
          <Text colorScheme="gray">卖贝</Text>
          {currentPrice.value ? (
            <LargeText bold>{currentPrice.value.sellPrice}</LargeText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <LargeText colorScheme="gray">获取中</LargeText>
            </Row>
          )}
          {platformRules.value ? (
            <SmallText colorScheme="gray">
              限价：{platformRules.value.sellOrderMinimumPrice}
            </SmallText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <SmallText colorScheme="gray">获取中</SmallText>
            </Row>
          )}
        </Column>
      </Row>
    </Column>
  );
}

function RealtimeAmount() {
  const currentAmount = useSignal<GetCurrentAmountResponse | null>(null);

  const totalPoolAmount = computed(() =>
    currentAmount.value
      ? currentAmount.value.buyAmount + currentAmount.value.sellAmount
      : null,
  );

  useEffect(() => {
    sendRequest<Record<string, never>, GetCurrentAmountResponse>({
      method: "GET",
      endpoint: "/v1/jpep/ftn-macket/current-amount",
      onSuccess: ({ data }) => (currentAmount.value = data),
    });
  }, []);

  return (
    <Column gap="gap-2">
      <Heading2>挂单量</Heading2>
      <Row className="justify-around">
        <Column gap="gap-1">
          <Text colorScheme="gray">买贝</Text>
          {currentAmount.value ? (
            <LargeText bold>{currentAmount.value.buyAmount}</LargeText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <LargeText colorScheme="gray">获取中</LargeText>
            </Row>
          )}
          {currentAmount.value && totalPoolAmount.value ? (
            <SmallText colorScheme="gray">
              占比：
              {(
                (currentAmount.value.buyAmount / totalPoolAmount.value) *
                100
              ).toFixed(2)}
              %
            </SmallText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <SmallText colorScheme="gray">获取中</SmallText>
            </Row>
          )}
        </Column>
        <Column gap="gap-1">
          <Text colorScheme="gray">卖贝</Text>
          {currentAmount.value ? (
            <LargeText bold>{currentAmount.value.sellAmount}</LargeText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <LargeText colorScheme="gray">获取中</LargeText>
            </Row>
          )}
          {currentAmount.value && totalPoolAmount.value ? (
            <SmallText colorScheme="gray">
              占比：
              {(
                (currentAmount.value.sellAmount / totalPoolAmount.value) *
                100
              ).toFixed(2)}
              %
            </SmallText>
          ) : (
            <Row gap="gap-2" itemsCenter>
              <LoaderIcon />
              <SmallText colorScheme="gray">获取中</SmallText>
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
  const amountDistribution =
    useSignal<GetCurrentAmountDistributionResponse | null>(null);

  useEffect(() => {
    amountDistribution.value = null;

    sendRequest<
      GetCurrentAmountDistributionRequest,
      GetCurrentAmountDistributionResponse
    >({
      method: "GET",
      endpoint: "/v1/jpep/ftn-macket/current-amount-distribution",
      queryArgs: {
        type: tradeType.value,
      },
      onSuccess: ({ data }) => (amountDistribution.value = data),
    });
  }, [tradeType.value]);

  return (
    <Column gap="gap-2">
      <Heading2>挂单量分布</Heading2>
      <Select
        id="amount-distribution-trade-type"
        value={tradeType}
        options={tradeTypeOptions}
        fullWidth
      />
      <BarChart
        className="h-72 max-w-xl w-full"
        dataReady={!!amountDistribution.value}
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
              data: !amountDistribution.value
                ? undefined
                : Object.entries(amountDistribution.value.amountDistribution),
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
      <Heading1>实时数据</Heading1>

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
  const buyPriceTrending = useSignal<GetPriceHistoryResponse | null>(null);
  const sellPriceTrending = useSignal<GetPriceHistoryResponse | null>(null);

  useEffect(() => {
    buyPriceTrending.value = null;
    sellPriceTrending.value = null;

    sendRequest<GetPriceHistoryRequest, GetPriceHistoryResponse>({
      method: "GET",
      endpoint: "/v1/jpep/ftn-macket/price-history",
      queryArgs: {
        type: "buy",
        range: timeRange.value,
        resolution: timeRange.value === "24h" ? "5m" : "1d",
      },
      onSuccess: ({ data }) => (buyPriceTrending.value = data),
    });

    sendRequest<GetPriceHistoryRequest, GetPriceHistoryResponse>({
      method: "GET",
      endpoint: "/v1/jpep/ftn-macket/price-history",
      queryArgs: {
        type: "sell",
        range: timeRange.value,
        resolution: timeRange.value === "24h" ? "5m" : "1d",
      },
      onSuccess: ({ data }) => (sellPriceTrending.value = data),
    });
  }, [timeRange.value]);

  return (
    <Column gap="gap-2">
      <Heading1>贝价趋势</Heading1>
      <Select
        id="price-trending-time-range"
        value={timeRange}
        options={timeRangeSwitchData}
        fullWidth
      />
      <LineChart
        className="h-72 max-w-lg w-full"
        dataReady={!!buyPriceTrending.value && !!sellPriceTrending.value}
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
              data: !buyPriceTrending.value
                ? undefined
                : Object.entries(buyPriceTrending.value.history),
              color: "#3b82f6",
            },
            {
              type: "line",
              name: "卖贝（右侧）",
              smooth: true,
              data: !sellPriceTrending.value
                ? undefined
                : Object.entries(sellPriceTrending.value.history),
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
  const buyAmountTrending = useSignal<GetAmountHistoryResponse | null>(null);
  const sellAmountTrending = useSignal<GetAmountHistoryResponse | null>(null);

  useEffect(() => {
    buyAmountTrending.value = null;
    sellAmountTrending.value = null;

    sendRequest<GetPriceHistoryRequest, GetPriceHistoryResponse>({
      method: "GET",
      endpoint: "/v1/jpep/ftn-macket/amount-history",
      queryArgs: {
        type: "buy",
        range: timeRange.value,
        resolution: timeRange.value === "24h" ? "5m" : "1d",
      },
      onSuccess: ({ data }) => (buyAmountTrending.value = data),
    });

    sendRequest<GetPriceHistoryRequest, GetPriceHistoryResponse>({
      method: "GET",
      endpoint: "/v1/jpep/ftn-macket/amount-history",
      queryArgs: {
        type: "sell",
        range: timeRange.value,
        resolution: timeRange.value === "24h" ? "5m" : "1d",
      },
      onSuccess: ({ data }) => (sellAmountTrending.value = data),
    });
  }, [timeRange.value]);
  return (
    <Column gap="gap-2">
      <Heading1>挂单量趋势</Heading1>
      <Select
        id="amount-trending-time-range"
        value={timeRange}
        options={timeRangeSwitchData}
        fullWidth
      />
      <LineChart
        className="h-72 max-w-lg w-full"
        dataReady={!!buyAmountTrending.value && !!sellAmountTrending.value}
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
              data: !buyAmountTrending.value
                ? undefined
                : Object.entries(buyAmountTrending.value.history),
              color: "#3b82f6",
            },
            {
              type: "line",
              name: "卖贝（右侧）",
              smooth: true,
              data: !sellAmountTrending.value
                ? undefined
                : Object.entries(sellAmountTrending.value.history),
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
    <Column gap="gap-8">
      <PlatformInfo />
      <RealtimeData />

      <Grid cols="grid-cols-1 lg:grid-cols-2" gap="gap-8">
        <PriceHistory />
        <AmountHistory />
      </Grid>
    </Column>
  );
}
