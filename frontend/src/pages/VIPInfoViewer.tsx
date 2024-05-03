import { computed, signal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  LargeText,
  Row,
  SolidButton,
  Text,
  TextInput,
  toastWarning,
} from "@sscreator/ui";
import { useEffect } from "preact/hooks";
import { useVIPInfo, type GetVIPInfoResponse } from "../models/users";
import { userUrlToSlug } from "../utils/jianshuHelper";
import {
  getDate,
  getHumanReadableTimeDelta,
  parseTime,
} from "../utils/timeHelper";
import VIPBadgeBronzeURL from "/vip_badges/vip_badge_bronze.png";
import VIPBadgeGoldURL from "/vip_badges/vip_badge_gold.png";
import VIPBadgePlatinaURL from "/vip_badges/vip_badge_platina.png";
import VIPBadgeSilverURL from "/vip_badges/vip_badge_silver.png";

const userUrl = signal("");
const userSlug = computed(() => userUrlToSlug(userUrl.value));

const VIPTypeToBadgeImageURL: Record<string, string> = {
  铜牌: VIPBadgeBronzeURL,
  银牌: VIPBadgeSilverURL,
  金牌: VIPBadgeGoldURL,
  白金: VIPBadgePlatinaURL,
};

function handleQuery(trigger: () => void) {
  if (!userSlug.value) {
    toastWarning("请输入有效的用户个人主页链接");
    return;
  }

  trigger();
}

function Result({ VIPInfo }: { VIPInfo?: GetVIPInfoResponse }) {
  if (!VIPInfo) return null;

  const expireDate = VIPInfo.expireDate ? parseTime(VIPInfo.expireDate) : null;

  return (
    <Row className="flex-wrap justify-around">
      <Column gap="gap-1">
        <Text color="gray">用户</Text>
        <ExternalLink className="text-lg" href={userUrl.value}>
          {VIPInfo.userName}
        </ExternalLink>
      </Column>
      <Column gap="gap-1">
        <Text color="gray">会员等级</Text>
        <Row gap="gap-1" itemsCenter>
          <img
            className="h-5 w-5"
            src={VIPTypeToBadgeImageURL[VIPInfo.type]}
            alt={`${VIPInfo.type}会员图标`}
          />
          <LargeText>{VIPInfo.isVIP ? VIPInfo.type : "无会员"}</LargeText>
        </Row>
      </Column>
      {VIPInfo.isVIP && (
        <Column gap="gap-1">
          <Text color="gray">会员到期时间</Text>
          <LargeText>{getDate(expireDate!)}</LargeText>
          <Text color="gray">{getHumanReadableTimeDelta(expireDate!)}</Text>
        </Column>
      )}
    </Row>
  );
}

export default function VIPInfoViewer() {
  const {
    data: VIPInfo,
    isLoading,
    trigger,
    reset,
  } = useVIPInfo({
    userSlug: userSlug.value!,
  });

  useEffect(() => {
    reset();
  }, [userUrl.value]);

  return (
    <>
      <TextInput
        id="user-url"
        label="用户个人主页链接"
        value={userUrl}
        onEnter={() => handleQuery(trigger)}
        errorMessage={userUrl.value && !userSlug.value ? "链接无效" : undefined}
        selectAllOnFocus
      />
      <SolidButton
        onClick={() => handleQuery(trigger)}
        loading={isLoading}
        fullWidth
      >
        查询
      </SolidButton>

      <Result VIPInfo={VIPInfo} />
    </>
  );
}
