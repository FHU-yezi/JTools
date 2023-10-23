import { batch, signal } from "@preact/signals";
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
import type {
  VIPInfoRequest,
  VIPInfoResponse,
} from "../models/VIPInfoViewer/VIPInfo";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
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
const userName = signal<string | undefined>(undefined);
const isLoading = signal(false);
const VIPType = signal<string | undefined>(undefined);
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
    toastWarning("请输入用户个人主页链接");
    return;
  }

  fetchData<VIPInfoRequest, VIPInfoResponse>(
    "POST",
    "/tools/VIP_info_viewer/VIP_info",
    {
      user_url: userURL.value,
    },
    (data) =>
      batch(() => {
        userName.value = data.name;
        VIPType.value = data.VIP_type;
        if (data.VIP_expire_time !== undefined) {
          VIPExpireTime.value = parseTime(data.VIP_expire_time);
        }
      }),
    commonAPIErrorHandler,
    isLoading,
  );
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
          {VIPType.value !== "无会员" && (
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
