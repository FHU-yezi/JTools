import { Avatar, Badge, Button, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { batch, signal } from "@preact/signals";
import SSLink from "../components/SSLink";
import SSTextInput from "../components/SSTextInput";
import {
  VIPInfoRequest,
  VIPInfoResponse,
} from "../models/VIPInfoViewer/VIPInfo";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { getDate, parseTime } from "../utils/timeHelper";
import VIPBadgeBronzeURL from "/img/vip_badge_bronze.png";
import VIPBadgeGoldURL from "/img/vip_badge_gold.png";
import VIPBadgePlatinaURL from "/img/vip_badge_platina.png";
import VIPBadgeSilverURL from "/img/vip_badge_silver.png";

const userURL = signal("");
const hasResult = signal(false);
const userName = signal("");
const isLoading = signal(false);
const VIPType = signal("");
const VIPExpireTime = signal<Date | undefined>(undefined);
const VIPExpireTimeToNowHumanReadable = signal("");

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

  if (userURL.value.length === 0) {
    notifications.show({
      message: "请输入用户个人主页链接",
      color: "blue",
    });
    return;
  }

  try {
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
          if (typeof data.VIP_expire_time !== "undefined") {
            VIPExpireTime.value = parseTime(data.VIP_expire_time);
            VIPExpireTimeToNowHumanReadable.value =
              data.VIP_expire_time_to_now_human_readable!;
          }
        }),
      commonAPIErrorHandler,
      hasResult,
      isLoading
    );
  } catch {}
}

export default function VIPInfoViewer() {
  return (
    <Stack>
      <SSTextInput
        label="用户个人主页链接"
        value={userURL}
        onEnter={handleQuery}
      />
      <Button onClick={handleQuery} loading={isLoading.value}>
        查询
      </Button>
      {hasResult.value && (
        <>
          <Text>
            昵称：
            <SSLink url={userURL.value} label={userName.value} isExternal />
          </Text>
          <Text>
            会员级别：
            <Badge
              size="lg"
              pl={0}
              color="gray"
              leftSection={
                <Avatar
                  alt={`${VIPType.value} 徽章图片`}
                  size={24}
                  mr={6}
                  src={VIPTypeToBadgeImageURL[VIPType.value]}
                />
              }
            >
              {VIPType.value}
            </Badge>
          </Text>
          {VIPType.value !== "无会员" && (
            <Text>
              到期时间：
              {getDate(VIPExpireTime.value!)}
              （剩余 {VIPExpireTimeToNowHumanReadable.value}）
            </Text>
          )}
        </>
      )}
    </Stack>
  );
}
