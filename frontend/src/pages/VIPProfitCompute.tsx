import {
  Avatar, Card, Center, Group, MantineColor, SegmentedControl, SimpleGrid, Stack, Text,
} from "@mantine/core";
import { computed, signal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";
import SSNumberInput from "../components/SSNumberInput";
import VIPBadgeBronzeURL from "../img/vip_badge_bronze.png";
import VIPBadgeGoldURL from "../img/vip_badge_gold.png";
import VIPBadgePlatinaURL from "../img/vip_badge_platina.png";
import VIPBadgeSilverURL from "../img/vip_badge_silver.png";
import { RoundFloat } from "../utils/numberHelper";

type VIPLevelType = "bronze" | "silver" | "gold" | "platina"

const VIPLevelToText: Record<VIPLevelType, string> = {
  bronze: "铜牌会员",
  silver: "银牌会员",
  gold: "金牌会员",
  platina: "白金会员",
};

const VIPLevelToPrice: Record<VIPLevelType, number> = {
  bronze: 1880,
  silver: 8980,
  gold: 22980,
  platina: 64980,
};

const VIPLevelToBadgeImageURL: Record<VIPLevelType, string> = {
  bronze: VIPBadgeBronzeURL,
  silver: VIPBadgeSilverURL,
  gold: VIPBadgeGoldURL,
  platina: VIPBadgePlatinaURL,
};

const VIPLevelToBaseEarningRate: Record<VIPLevelType, number> = {
  bronze: 0.048,
  silver: 0.062,
  gold: 0.072,
  platina: 0.082,
};

const FPCountToFPCountEarningRateFactor: Record<number, number> = {
  10000: 1.0,
  100000: 1.2,
  500000: 1.5,
  1500000: 2.0,
  3000000: 2.5,
};

type PromoterLevelType = "none" | "normal" | "diamod" | "crown" | "supreme"

const promoterLevelToText: Record<PromoterLevelType, string> = {
  none: "非推广大使",
  normal: "普通推广大使",
  diamod: "钻石推广大使",
  crown: "皇冠推广大使",
  supreme: "至尊推广大使",
};

const membersCountToPromoterLevel: Record<number, PromoterLevelType> = {
  5: "none",
  30: "normal",
  99: "diamod",
  999: "crown",
};

const promoterLevelToPromoterEarningRateFactor: Record<PromoterLevelType, number> = {
  none: 1.0,
  normal: 1.05,
  diamod: 1.1,
  crown: 1.2,
  supreme: 1.3,
};

const promoterLevelToLevel1MembersFPEarningRate: Record<PromoterLevelType, number> = {
  none: 0.0,
  normal: 0.01,
  diamod: 0.02,
  crown: 0.03,
  supreme: 0.04,
};

const promoterLevelToLevel2MembersFPEarningRate: Record<PromoterLevelType, number> = {
  none: 0.0,
  normal: 0.003,
  diamod: 0.006,
  crown: 0.009,
  supreme: 0.012,
};

const VIPLevel = signal<VIPLevelType>("bronze");
const VIPText = computed(() => VIPLevelToText[VIPLevel.value]);
const VIPPrice = computed(() => VIPLevelToPrice[VIPLevel.value]);
const baseEarningRate = computed(() => VIPLevelToBaseEarningRate[VIPLevel.value]);
const FPCount = signal(0);
const FPCountEarningRateFactor = computed(() => {
  // eslint-disable-next-line no-restricted-syntax
  for (const targetFPCount in FPCountToFPCountEarningRateFactor) {
    if (FPCount <= targetFPCount) {
      return FPCountToFPCountEarningRateFactor[targetFPCount];
    }
  }
  return 3.0;
});
const membersCount = signal(0);
const promoterLevel = computed(() => {
  // eslint-disable-next-line no-restricted-syntax
  for (const targetMembersCount in membersCountToPromoterLevel) {
    if (membersCount <= targetMembersCount) {
      return membersCountToPromoterLevel[targetMembersCount];
    }
  }
  return "supreme" as PromoterLevelType;
});
const promoterText = computed(() => promoterLevelToText[promoterLevel.value]);
const promoterLevelEarningRateFactor = computed(
  () => promoterLevelToPromoterEarningRateFactor[promoterLevel.value],
);
const earningRate = computed(
  () => RoundFloat(baseEarningRate.value
     * FPCountEarningRateFactor.value
    * promoterLevelEarningRateFactor.value, 4),
);
const Level1MembersFPCount = signal(0);
const Level2MembersFPCount = signal(0);
const earningFromLevel1Members = computed(
  () => Level1MembersFPCount.value * promoterLevelToLevel1MembersFPEarningRate[promoterLevel.value],
);
const earningFromLevel2Members = computed(
  () => Level2MembersFPCount.value * promoterLevelToLevel2MembersFPEarningRate[promoterLevel.value],
);
const earningFromMembers = computed(() => earningFromLevel1Members + earningFromLevel2Members);
const earningFromCreation = signal(0);
const earningFromCreationToFP = computed(() => earningFromCreation.value / 2); // 创作收益一半是简书钻
const annualEarning = computed(() => {
  let nowFPCount = FPCount.value;
  for (let i = 0; i < 366; i++) {
    const earningFromFP = nowFPCount * (earningRate.value / 365);
    nowFPCount += earningFromFP;
    nowFPCount += earningFromCreationToFP.value;
  }
  nowFPCount += earningFromLevel1Members.value;
  nowFPCount += earningFromLevel2Members.value;
  return RoundFloat(nowFPCount - FPCount.value, 2);
});
const pureAnnualEarning = computed(() => annualEarning.value - VIPPrice.value);
const pureMonthlyEarning = computed(() => pureAnnualEarning.value / 12);
const returnRate = computed(
  () => RoundFloat(pureAnnualEarning.value / (FPCount.value + VIPPrice.value), 4),
);
const canGetMoneyBack = computed(() => pureAnnualEarning.value >= 0);

interface ResultItemProps {
  label: string;
  description?: string;
  value: number;
  valueColor?: MantineColor;
  ndigits: number;
  asPercentage?: boolean;
  asTimes?: boolean;
  bold?: boolean;
}

function ResultItem({
  label, description = "", value, valueColor, ndigits, asPercentage = false, asTimes = false, bold = false,
}: ResultItemProps) {
  const fixedValue = (asPercentage ? value * 100 : value).toFixed(ndigits);

  let valuePart: string | number;
  if (asPercentage) {
    valuePart = `${typeof fixedValue === "number" ? fixedValue : fixedValue}%`;
  } else if (asTimes) {
    valuePart = `x${fixedValue}`;
  } else {
    valuePart = fixedValue;
  }

  return (
    <Group position="apart">
      <Text fw={bold ? 600 : undefined}>
        {label}
        <Text size="sm">{description.length !== 0 && `（${description}）`}</Text>
      </Text>
      <Text fw={bold ? 600 : undefined} color={valueColor}>{valuePart}</Text>
    </Group>
  );
}

interface ResultGroupProps {
  children: JSX.Element | JSX.Element[] | (() => JSX.Element);
  label: string;
}

function ResultGroup({ children, label }: ResultGroupProps) {
  return (
    <Card shadow="sm" radius="md" padding="lg" withBorder>
      <Text size="xl" fw={600} mb={14}>{label}</Text>
      <Stack spacing="sm">
        {children}
      </Stack>
    </Card>
  );
}

export default function VIPProfitCompute() {
  return (
    <Stack>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Text fw={600}>会员等级</Text>
        <SegmentedControl
          mt={6}
          value={VIPLevel.value}
          onChange={(newValue: VIPLevelType) => VIPLevel.value = newValue}
          data={[
            {
              label: (
                <Center>
                  <Avatar size={20} mr={8} src={VIPBadgeBronzeURL} />
                  <Text>铜牌</Text>
                </Center>
              ),
              value: "bronze",
            },
            {
              label: (
                <Center>
                  <Avatar size={20} mr={8} src={VIPBadgeSilverURL} />
                  银牌
                </Center>
              ),
              value: "silver",
            },
            {
              label: (
                <Center>
                  <Avatar size={20} mr={8} src={VIPBadgeGoldURL} />
                  金牌
                </Center>
              ),
              value: "gold",
            },
            {
              label: (
                <Center>
                  <Avatar size={20} mr={8} src={VIPBadgePlatinaURL} />
                  白金
                </Center>
              ),
              value: "platina",
            },
          ]}
        />
      </div>
      <SSNumberInput label="持钻量" value={FPCount} min={0} />
      <SSNumberInput label="旗下会员数" value={membersCount} min={0} showControls />
      <SSNumberInput label="旗下一级会员持钻量" value={Level1MembersFPCount} min={0} />
      <SSNumberInput label="旗下二级会员持钻量" value={Level2MembersFPCount} min={0} />
      <SSNumberInput label="每日创作收益" value={earningFromCreation} min={0} />

      <SimpleGrid
        cols={2}
        breakpoints={[
          { maxWidth: "sm", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
        mt={18}
      >
        <ResultGroup label="会员持钻收益">
          <ResultItem label="基础收益率" description={VIPText.value} value={baseEarningRate.value} ndigits={2} asPercentage />
          <ResultItem label="持钻量加成倍数" value={FPCountEarningRateFactor.value} ndigits={2} asTimes />
          <ResultItem label="推广大使加成倍数" description={promoterText.value} value={promoterLevelEarningRateFactor.value} ndigits={2} asTimes />
          <ResultItem label="会员收益率" value={earningRate.value} ndigits={2} asPercentage bold />
        </ResultGroup>
        <ResultGroup label="下级会员持钻分红">
          <ResultItem label="一级会员持钻分红" value={earningFromLevel1Members.value} ndigits={2} />
          <ResultItem label="二级会员持钻分红" value={earningFromLevel2Members.value} ndigits={2} />
          <ResultItem label="持钻分红总计" value={earningFromMembers.value} ndigits={2} bold />
        </ResultGroup>
        <ResultGroup label="总计">
          <ResultItem label="毛收益（每年）" value={annualEarning.value} ndigits={2} />
          <ResultItem label="会员成本" description={VIPText.value} value={VIPPrice.value} ndigits={2} />
          <ResultItem label="净收益（每年）" value={pureAnnualEarning.value} ndigits={2} />
          <ResultItem label="净收益（每月）" value={pureMonthlyEarning.value} ndigits={2} />
          <ResultItem label="年回报率" value={returnRate.value} ndigits={2} valueColor={canGetMoneyBack.value ? "green" : "red"} asPercentage bold />
        </ResultGroup>
        <ResultGroup label="注意事项">
          <Text>1. 收益计算已考虑复利，但未考虑持钻量增加对收益率的提升，计算结果可能偏低。</Text>
          <Text>2. 每月净收益为平均值，由于持钻量上升，实际收益逐月增长。</Text>
          <Text>3. 全部数值单位均为简书贝。</Text>
          <Text fw={600}>本工具不作为投资参考。</Text>
        </ResultGroup>
      </SimpleGrid>
    </Stack>
  );
}
