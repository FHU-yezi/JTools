import { Badge, Button, Stack, Text, useMantineTheme } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { batch, signal } from "@preact/signals";
import JMFTextInput from "../components/JMFTextInput";
import {
  VIPInfoRequest,
  VIPInfoResponse,
} from "../models/VIPInfoViewer/VIPInfo";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { getDatetime } from "../utils/timeHelper";

const userURL = signal("");
const hasResult = signal(false);
const userName = signal("");
const isLoading = signal(false);
const VIPType = signal("");
const VIPExpireTime = signal<Date | undefined>(undefined);
const VIPExpireTimeToNowHumanReadable = signal("");

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
          userName.value = data!.name;
          VIPType.value = data!.VIP_type;
          if (typeof data!.VIP_expire_time !== "undefined") {
            VIPExpireTime.value = new Date(data!.VIP_expire_time * 1000);
            VIPExpireTimeToNowHumanReadable.value =
              data!.VIP_expire_time_to_now_human_readable!;
          }
        }),
      commonAPIErrorHandler,
      hasResult,
      isLoading,
    );
  } catch {}
}

export default function VIPInfoViewer() {
  const theme = useMantineTheme();

  return (
    <Stack>
      <JMFTextInput label="用户个人主页链接" value={userURL} />
      <Button onClick={handleQuery} loading={isLoading.value}>查询</Button>
      {hasResult.value && (
        <>
          <Text>
            昵称：
            <a
              href={userURL.value}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: theme.colors.blue[6],
                textDecoration: "none",
              }}
            >
              {userName.value}
            </a>
          </Text>
          <Text>
            会员级别：<Badge size="lg">{VIPType.value}</Badge>
          </Text>
          {VIPType.value !== "无会员" && (
            <Text>
              到期时间：{getDatetime(VIPExpireTime.value!)}（剩余{" "}
              {VIPExpireTimeToNowHumanReadable.value}）
            </Text>
          )}
        </>
      )}
    </Stack>
  );
}
