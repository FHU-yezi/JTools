import { computed, signal, useSignalEffect } from "@preact/signals";
import {
  Card,
  Column,
  Grid,
  LargeText,
  NumberInput,
  Row,
  Select,
  SmallText,
  Text,
} from "@sscreator/ui";
import VIPBadgeBronzeURL from "/vip_badges/vip_badge_bronze.png";
import VIPBadgeGoldURL from "/vip_badges/vip_badge_gold.png";
import VIPBadgePlatinaURL from "/vip_badges/vip_badge_platina.png";
import VIPBadgeSilverURL from "/vip_badges/vip_badge_silver.png";

type VIPLevelType = "bronze" | "silver" | "gold" | "platina";

interface VIPDataItem {
  name: string;
  price: number;
  earningRate: number;
}

const VIPData: Record<VIPLevelType, VIPDataItem> = {
  bronze: {
    name: "铜牌会员",
    price: 1880,
    earningRate: 0.048,
  },
  silver: {
    name: "银牌会员",
    price: 8980,
    earningRate: 0.062,
  },
  gold: {
    name: "金牌会员",
    price: 22980,
    earningRate: 0.072,
  },
  platina: {
    name: "白金会员",
    price: 64980,
    earningRate: 0.082,
  },
};

type PromoterLevelType = "none" | "normal" | "diamod" | "crown" | "supreme";

interface PromoterDataItem {
  name: string;
  requiredMembersCount: number;
  earningRateFactor: number;
  level1MembersReferralRewardRate: number;
  level2MembersReferralRewardRate: number;
}

const promoterData: Record<PromoterLevelType, PromoterDataItem> = {
  none: {
    name: "非推广大使",
    requiredMembersCount: 0,
    earningRateFactor: 1,
    level1MembersReferralRewardRate: 0,
    level2MembersReferralRewardRate: 0,
  },
  normal: {
    name: "普通推广大使",
    requiredMembersCount: 6,
    earningRateFactor: 1.05,
    level1MembersReferralRewardRate: 0.01,
    level2MembersReferralRewardRate: 0.003,
  },
  diamod: {
    name: "钻石推广大使",
    requiredMembersCount: 31,
    earningRateFactor: 1.1,
    level1MembersReferralRewardRate: 0.02,
    level2MembersReferralRewardRate: 0.006,
  },
  crown: {
    name: "皇冠推广大使",
    requiredMembersCount: 100,
    earningRateFactor: 1.2,
    level1MembersReferralRewardRate: 0.03,
    level2MembersReferralRewardRate: 0.009,
  },
  supreme: {
    name: "至尊推广大使",
    requiredMembersCount: 1000,
    earningRateFactor: 1.3,
    level1MembersReferralRewardRate: 0.04,
    level2MembersReferralRewardRate: 0.012,
  },
};

// 输入参数
const VIPLevel = signal<VIPLevelType>("bronze");
const FPCount = signal<number>(0);
const dailyCreationEarning = signal(0);
const membersCount = signal(0);
const level1MembersFPCount = signal(0);
const level2MembersFPCount = signal(0);

// 成本
const cost = computed(() => VIPData[VIPLevel.value].price);

// 推广大使等级
const promoterLevel = computed<PromoterLevelType>(() => {
  if (membersCount.value < promoterData.normal.requiredMembersCount)
    return "none";
  if (membersCount.value < promoterData.diamod.requiredMembersCount)
    return "normal";
  if (membersCount.value < promoterData.crown.requiredMembersCount)
    return "diamod";
  if (membersCount.value < promoterData.supreme.requiredMembersCount)
    return "crown";
  return "supreme";
});

// 基础收益率
const baseEarningRate = computed(() => VIPData[VIPLevel.value].earningRate);
// 持钻量收益加成系数
const FPCountEarningRateFactor = computed(() => {
  if (FPCount.value < 10000) return 1;
  if (FPCount.value < 100000) return 1.2;
  if (FPCount.value < 500000) return 1.5;
  if (FPCount.value < 1500000) return 2;
  if (FPCount.value < 3000000) return 2.5;
  return 3.0;
});
// 推广大使收益加成系数
const promoterLevelEarningRateFactor = computed(
  () => promoterData[promoterLevel.value].earningRateFactor,
);
// 总收益率
const earningRate = computed(
  () =>
    baseEarningRate.value *
    FPCountEarningRateFactor.value *
    promoterLevelEarningRateFactor.value,
);

// 一级会员推广奖励
const level1MembersReferralRewards = computed(
  () =>
    level1MembersFPCount.value *
    promoterData[promoterLevel.value].level1MembersReferralRewardRate,
);
// 二级会员推广奖励
const level2MembersReferralRewards = computed(
  () =>
    level2MembersFPCount.value *
    promoterData[promoterLevel.value].level2MembersReferralRewardRate,
);
// 推广奖励总额
const totalReferralRewards = computed(
  () => level1MembersReferralRewards.value + level2MembersReferralRewards.value,
);

// 每年毛利润
const annualGrossProfit = computed(() => {
  let nowFPCount = FPCount.value;

  // 计算 365 天的收益
  for (let i = 0; i < 366; i += 1) {
    // 持钻奖励
    nowFPCount += nowFPCount * (earningRate.value / 365);
    // 创作收益
    nowFPCount += dailyCreationEarning.value / 2; // 创作收益一半是简书钻
  }
  // 推广奖励
  nowFPCount += totalReferralRewards.value;

  return nowFPCount - FPCount.value;
});
// 每月毛利润
const monthlyGrossProfit = computed(() => annualGrossProfit.value / 12);

// 每年净利润
const annualNetProfit = computed(() => annualGrossProfit.value - cost.value);
// 每月净利润
const monthlyNetProfit = computed(() => annualNetProfit.value / 12);

// 回报率
const returnRate = computed(
  () => annualNetProfit.value / (FPCount.value + cost.value),
);
// 能否回本
const canGetMoneyBack = computed(() => annualNetProfit.value >= 0);

function VIPLevelSelect() {
  const VIPLevelOptions = [
    {
      label: "铜牌",
      value: "bronze",
      leftIcon: (
        <img
          className="mr-1 h-6 w-6"
          src={VIPBadgeBronzeURL}
          alt="铜牌会员图标"
        />
      ),
    },
    {
      label: "银牌",
      value: "silver",
      leftIcon: (
        <img
          className="mr-1 h-6 w-6"
          src={VIPBadgeSilverURL}
          alt="银牌会员图标"
        />
      ),
    },
    {
      label: "金牌",
      value: "gold",
      leftIcon: (
        <img
          className="mr-1 h-6 w-6"
          src={VIPBadgeGoldURL}
          alt="金牌会员图标"
        />
      ),
    },
    {
      label: "白金",
      value: "platina",
      leftIcon: (
        <img
          className="mr-1 h-6 w-6"
          src={VIPBadgePlatinaURL}
          alt="白金会员图标"
        />
      ),
    },
  ];

  return (
    <Select
      id="vip-level"
      label="会员等级"
      value={VIPLevel}
      options={VIPLevelOptions}
      fullWidth
    />
  );
}

function ParamsInput() {
  useSignalEffect(() => {
    if (FPCount.value < 0) {
      FPCount.value = 0;
    }
    if (dailyCreationEarning.value < 0) {
      dailyCreationEarning.value = 0;
    }
    if (membersCount.value < 0) {
      membersCount.value = 0;
    }
    if (level1MembersFPCount.value < 0) {
      level1MembersFPCount.value = 0;
    }
    if (level2MembersFPCount.value < 0) {
      level2MembersFPCount.value = 0;
    }
  });

  return (
    <Column>
      <VIPLevelSelect />
      <Grid cols="grid-cols-1 md:grid-cols-2">
        <NumberInput id="fp-count" label="持钻量" value={FPCount} />
        <NumberInput
          id="daily-creation-earning"
          label="每日创作收益"
          value={dailyCreationEarning}
        />
      </Grid>
      <NumberInput id="members-count" label="旗下会员数" value={membersCount} />
      {membersCount.value !== 0 && (
        <Grid cols="grid-cols-1 md:grid-cols-2">
          <NumberInput
            id="level-1-members-fp-count"
            label="旗下一级会员持钻量"
            value={level1MembersFPCount}
          />
          <NumberInput
            id="level-2-members-fp-count"
            label="旗下二级会员持钻量"
            value={level2MembersFPCount}
          />
        </Grid>
      )}
    </Column>
  );
}

function Summary() {
  return (
    <Card className="flex flex-wrap justify-around gap-4" shadow withPadding>
      <Column gap="gap-1">
        <Text color="gray">年回报率</Text>
        <Text
          className="text-2xl"
          color={canGetMoneyBack.value ? "success" : "danger"}
          bold
        >
          {(returnRate.value * 100).toFixed(2)}%
        </Text>
      </Column>
      <Column gap="gap-1">
        <Text color="gray">净利润</Text>
        <Text className="text-2xl" bold>
          {annualNetProfit.value.toFixed(2)}
        </Text>
        <SmallText color="gray">简书贝 / 年</SmallText>
      </Column>
      <Column gap="gap-1">
        <Text color="gray">成本</Text>
        <Text className="text-2xl" bold>
          {cost.value.toFixed(2)}
        </Text>
        <SmallText color="gray">简书贝 / 年</SmallText>
      </Column>
      <Column gap="gap-2">
        <Row gap="gap-1">
          <Text>毛利润：</Text>
          <Column className="items-end" gap="gap-2">
            <Row gap="gap-1">
              <Text bold>{annualGrossProfit.value.toFixed(2)}</Text>
              <Text color="gray">/ 年</Text>
            </Row>
            <Row gap="gap-1">
              <Text bold>{monthlyGrossProfit.value.toFixed(2)}</Text>
              <Text color="gray">/ 月</Text>
            </Row>
          </Column>
        </Row>
        <Row className="justify-between" gap="gap-1">
          <Text>净利润：</Text>
          <Text bold>{monthlyNetProfit.value.toFixed(2)}</Text>
          <Text color="gray">/ 月</Text>
        </Row>
      </Column>
    </Card>
  );
}

function VIPRewards() {
  return (
    <Card className="flex flex-col gap-4" shadow withPadding>
      <LargeText bold>会员收益</LargeText>
      <Column gap="gap-1">
        <Text color="gray">总收益率（年化）</Text>
        <Row gap="gap-1">
          <Text className="text-2xl" bold>
            {(earningRate.value * 100).toFixed(2)}%
          </Text>
        </Row>
      </Column>
      <Row className="justify-between" gap="gap-1">
        <Column gap="gap-1">
          <Text color="gray">基础收益率</Text>
          <LargeText>{(baseEarningRate.value * 100).toFixed(2)}%</LargeText>
          <SmallText color="gray">{VIPData[VIPLevel.value].name}</SmallText>
        </Column>
        <Column gap="gap-1">
          <Text color="gray">持钻量加成</Text>
          <LargeText>x{FPCountEarningRateFactor.value.toFixed(2)}</LargeText>
        </Column>
        <Column gap="gap-1">
          <Text color="gray">推广大使加成</Text>
          <LargeText>
            x{promoterLevelEarningRateFactor.value.toFixed(2)}
          </LargeText>
          <SmallText color="gray">
            {promoterData[promoterLevel.value].name}
          </SmallText>
        </Column>
      </Row>
    </Card>
  );
}

function ReferralRewards() {
  return (
    <Card className="flex flex-col gap-4" shadow withPadding>
      <LargeText bold>推广奖励</LargeText>
      <Column gap="gap-1">
        <Text color="gray">总分红</Text>
        <Text className="text-2xl" bold>
          {totalReferralRewards.value.toFixed(2)}
        </Text>
      </Column>
      <Row className="justify-around">
        <Column gap="gap-1">
          <Text color="gray">一级会员</Text>
          <LargeText>{level2MembersReferralRewards.value.toFixed(2)}</LargeText>
          <SmallText color="gray">简书贝 / 年</SmallText>
        </Column>
        <Column gap="gap-1">
          <Text color="gray">二级会员</Text>
          <LargeText>{level1MembersReferralRewards.value.toFixed(2)}</LargeText>
          <SmallText color="gray">简书贝 / 年</SmallText>
        </Column>
      </Row>
    </Card>
  );
}
export default function VIPProfitCompute() {
  return (
    <>
      <ParamsInput />

      <Summary />
      <Grid cols="grid-cols-1 sm:grid-cols-2">
        <VIPRewards />
        <ReferralRewards />
      </Grid>
      <Text className="text-right" bold>
        本工具不构成任何投资建议
      </Text>
    </>
  );
}
