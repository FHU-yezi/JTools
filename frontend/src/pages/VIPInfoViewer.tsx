import { computed, signal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  LargeText,
  Row,
  SolidButton,
  Text,
  TextInput,
} from "@sscreator/ui";
import type { GetVIPInfoResponse } from "../models/users";
import { userUrlToSlug } from "../utils/jianshuHelper";
import { sendRequest } from "../utils/sendRequest";
import {
  getDate,
  getHumanReadableTimeDelta,
  parseTime,
} from "../utils/timeHelper";
import { toastWarning } from "../utils/toastHelper";
import VIPBadgeBronzeURL from "/vip_badges/vip_badge_bronze.png";
import VIPBadgeGoldURL from "/vip_badges/vip_badge_gold.png";
import VIPBadgePlatinaURL from "/vip_badges/vip_badge_platina.png";
import VIPBadgeSilverURL from "/vip_badges/vip_badge_silver.png";

const userUrl = signal("");
const userSlug = computed(() => userUrlToSlug(userUrl.value));
const isLoading = signal(false);
const result = signal<GetVIPInfoResponse | undefined>(undefined);

const VIPTypeToBadgeImageURL: Record<string, string> = {
  铜牌: VIPBadgeBronzeURL,
  银牌: VIPBadgeSilverURL,
  金牌: VIPBadgeGoldURL,
  白金: VIPBadgePlatinaURL,
};

function handleQuery() {
  if (isLoading.value) {
    return;
  }

  if (userUrl.value.length === 0) {
    toastWarning({ message: "请输入用户个人主页链接" });
    return;
  }

  sendRequest<Record<string, never>, GetVIPInfoResponse>({
    method: "GET",
    endpoint: `/v1/users/${userSlug.value}/vip-info`,
    onSuccess: ({ data }) => (result.value = data),
    isLoading,
  });
}

function Result() {
  if (!result.value) {
    return null;
  }

  const expireDate = result.value.expireDate
    ? parseTime(result.value.expireDate)
    : null;

  return (
    <>
      <Column gap="gap-1">
        <Text colorScheme="gray">用户</Text>
        <ExternalLink className="text-lg" href={userUrl.value}>
          {result.value.userName}
        </ExternalLink>
      </Column>
      <Column gap="gap-1">
        <Text colorScheme="gray">会员等级</Text>
        <Row gap="gap-1" itemsCenter>
          <img
            className="h-5 w-5"
            src={VIPTypeToBadgeImageURL[result.value.type]}
            alt={`${result.value.type}会员图标`}
          />
          <LargeText>
            {result.value.isVIP ? result.value.type : "无会员"}
          </LargeText>
        </Row>
      </Column>
      {result.value.isVIP && (
        <Column gap="gap-1">
          <Text colorScheme="gray">会员到期时间</Text>
          <LargeText>{getDate(expireDate!)}</LargeText>
          <Text colorScheme="gray">
            {getHumanReadableTimeDelta(expireDate!)}
          </Text>
        </Column>
      )}
    </>
  );
}

export default function VIPInfoViewer() {
  return (
    <Column>
      <TextInput
        id="user-url"
        label="用户个人主页链接"
        value={userUrl}
        onEnter={handleQuery}
        selectAllOnFocus
      />
      <SolidButton onClick={handleQuery} loading={isLoading.value} fullWidth>
        查询
      </SolidButton>

      {result.value && <Result />}
    </Column>
  );
}
