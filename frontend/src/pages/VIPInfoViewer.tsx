import { computed, signal } from "@preact/signals";
import {
  Badge,
  Column,
  ExternalLink,
  PrimaryButton,
  Row,
  Text,
  TextInput,
} from "@sscreator/ui";
import type { GetVIPInfoResponse } from "../models/users";
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
const userSlug = computed(() => {
  const matchResult = userUrl.value.match(
    "https://www.jianshu.com/u/(\\w{6,12})",
  );
  if (matchResult !== null && matchResult[1] !== undefined) {
    return matchResult[1];
  }
  return undefined;
});
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

export default function VIPInfoViewer() {
  return (
    <Column>
      <TextInput
        label="用户个人主页链接"
        value={userUrl}
        onEnter={handleQuery}
      />
      <PrimaryButton onClick={handleQuery} loading={isLoading.value} fullWidth>
        查询
      </PrimaryButton>

      {result.value !== undefined && (
        <>
          <Text>
            昵称：
            <ExternalLink href={userUrl.value}>
              {result.value.userName}
            </ExternalLink>
          </Text>

          <Text>
            会员等级：
            {result.value.isVIP ? (
              <Badge
                textColor="text-zinc-500 dark:text-zinc-400"
                backgroundColor="bg-zinc-100 dark:bg-zinc-800"
              >
                <Row className="!flex-inline" gap="gap-1" verticalCenter>
                  <img
                    className="inline h-4 w-4 rounded-full"
                    src={VIPTypeToBadgeImageURL[result.value.type]}
                    alt={`${result.value.type} 徽章图标`}
                  />
                  <Text inline>{result.value.type}</Text>
                </Row>
              </Badge>
            ) : (
              <Text bold inline>
                无会员
              </Text>
            )}
          </Text>
          {result.value.isVIP && (
            <Text>
              到期时间：
              {getDate(parseTime(result.value.expireDate))}（
              {getHumanReadableTimeDelta(parseTime(result.value.expireDate))}）
            </Text>
          )}
        </>
      )}
    </Column>
  );
}
