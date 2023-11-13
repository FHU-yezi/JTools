import { batch, computed, signal } from "@preact/signals";
import {
  Badge,
  Column,
  ExternalLink,
  PrimaryButton,
  Row,
  Text,
  TextInput,
} from "@sscreator/ui";
import type { Dayjs } from "dayjs";
import type { GetVIPInfoResponse, VIPTypeEnum } from "../models/users";
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

const userURL = signal("");
const userSlug = computed(() => {
  const matchResult = userURL.value.match(
    "https://www.jianshu.com/u/(\\w{6,12})",
  );
  if (matchResult !== null && matchResult[1] !== undefined) {
    return matchResult[1];
  }
  return undefined;
});
const userName = signal<string | undefined>(undefined);
const isLoading = signal(false);
const VIPType = signal<VIPTypeEnum | undefined>(undefined);
const VIPExpireTime = signal<Dayjs | undefined>(undefined);

const VIPTypeToBadgeImageURL: Record<string, string> = {
  铜牌: VIPBadgeBronzeURL,
  银牌: VIPBadgeSilverURL,
  黄金: VIPBadgeGoldURL,
  白金: VIPBadgePlatinaURL,
};

function handleQuery() {
  if (isLoading.value) {
    return;
  }

  if (userURL.value.length === 0) {
    toastWarning({ message: "请输入用户个人主页链接" });
    return;
  }

  sendRequest<Record<string, never>, GetVIPInfoResponse>({
    method: "GET",
    endpoint: `/v1/users/${userSlug.value}/vip-info`,
    onSuccess: ({ data }) =>
      batch(() => {
        userName.value = data.userName;
        VIPType.value = data.type;
        if (data.expireDate !== undefined) {
          VIPExpireTime.value = parseTime(data.expireDate);
        }
      }),
    isLoading,
  });
}

export default function VIPInfoViewer() {
  return (
    <Column>
      <TextInput
        label="用户个人主页链接"
        value={userURL}
        onEnter={handleQuery}
      />
      <PrimaryButton onClick={handleQuery} loading={isLoading.value} fullWidth>
        查询
      </PrimaryButton>

      {userName.value !== undefined && (
        <Text>
          昵称：
          <ExternalLink href={userURL.value}>{userName.value}</ExternalLink>
        </Text>
      )}

      {VIPType.value !== undefined && (
        <>
          <Text>
            会员级别：
            <Badge
              textColor="text-zinc-500 dark:text-zinc-400"
              backgroundColor="bg-zinc-100 dark:bg-zinc-800"
            >
              <Row className="!flex-inline" gap="gap-1" verticalCenter>
                <img
                  className="inline h-4 w-4 rounded-full"
                  src={VIPTypeToBadgeImageURL[VIPType.value]}
                  alt={`${VIPType.value} 徽章图标`}
                />
                <Text inline>{VIPType.value}</Text>
              </Row>
            </Badge>
          </Text>
          {VIPType.value !== undefined && (
            <Text>
              到期时间：
              {getDate(VIPExpireTime.value!)}（
              {getHumanReadableTimeDelta(VIPExpireTime.value!)}）
            </Text>
          )}
        </>
      )}
    </Column>
  );
}
