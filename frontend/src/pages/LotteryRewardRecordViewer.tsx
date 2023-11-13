import type { Signal } from "@preact/signals";
import { batch, computed, effect, signal, useSignal } from "@preact/signals";
import {
  Checkbox,
  Column,
  Grid,
  LoadingArea,
  NoResultNotice,
  PrimaryButton,
  Text,
  TextInput,
  Tooltip,
} from "@sscreator/ui";
import { useEffect } from "preact/hooks";
import SSLazyLoadTable from "../components/SSLazyLoadTable";
import type { GetRewardsResponse } from "../models/lottery";
import type {
  GetLotteryWinRecordItem,
  GetLotteryWinRecordsRequest,
  GetLotteryWinRecordsResponse,
} from "../models/users";
import { sendRequest } from "../utils/sendRequest";
import { removeSpace } from "../utils/textHelper";
import { getDatetime, parseTime } from "../utils/timeHelper";
import { toastWarning } from "../utils/toastHelper";

const rewards = signal<string[] | undefined>(undefined);
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
const selectedRewards = signal<string[]>([]);
const isLoading = signal(false);
const hasMore = signal(true);
const result = signal<GetLotteryWinRecordItem[] | undefined>(undefined);

function handleQuery() {
  if (userURL.value.length === 0) {
    toastWarning({ message: "请输入用户个人主页链接" });
    return;
  }
  sendRequest<GetLotteryWinRecordsRequest, GetLotteryWinRecordsResponse>({
    method: "GET",
    endpoint: `/v1/users/${userSlug.value}/lottery-win-records`,
    queryArgs: {
      target_rewards: selectedRewards.value,
    },
    onSuccess: ({ data }) =>
      batch(() => {
        result.value = data.records;
        if (data.records.length === 0) {
          hasMore.value = false;
        }
      }),
    isLoading,
  });
}

function handleLoadMore() {
  sendRequest<GetLotteryWinRecordsRequest, GetLotteryWinRecordsResponse>({
    method: "GET",
    endpoint: `/v1/users/${userSlug.value}/lottery-win-records`,
    queryArgs: {
      target_rewards: selectedRewards.value,
      offset: result.value!.length,
    },
    onSuccess: ({ data }) =>
      batch(() => {
        result.value = result.value!.concat(data.records);
        if (data.records.length === 0) {
          hasMore.value = false;
        }
      }),
    isLoading,
  });
}

function RewardsFliter() {
  const rewardSelectedSignals = useSignal<Record<string, Signal<boolean>>>({});
  const dataReady = useSignal(false);

  useEffect(() => {
    sendRequest<Record<string, never>, GetRewardsResponse>({
      method: "GET",
      endpoint: "/v1/lottery/rewards",
      onSuccess: ({ data }) =>
        batch(() => {
          rewards.value = data.rewards;
          selectedRewards.value = data.rewards;
          rewards.value.forEach(
            (name) => (rewardSelectedSignals.value[name] = signal(true)),
          );
          dataReady.value = true;
        }),
    });
  }, []);

  effect(
    () =>
      (selectedRewards.value = Object.keys(rewardSelectedSignals.value)
        .filter((name) => rewardSelectedSignals.value[name].value === true)
        .map((item) => removeSpace(item))),
  );

  return (
    <div>
      <Text className="mb-1.5" bold>
        奖项筛选
      </Text>
      <LoadingArea className="h-36 w-full sm:h-16" loading={!dataReady.value}>
        {dataReady.value && (
          <Grid cols="grid-cols-1 sm:grid-cols-2">
            {Object.entries(rewardSelectedSignals.value).map(
              ([name, value]) => (
                <Checkbox label={name} value={value} />
              ),
            )}
          </Grid>
        )}
      </LoadingArea>
    </div>
  );
}

function ResultTable() {
  return (
    <SSLazyLoadTable
      data={result.value!.map((item) => ({
        时间: <Text center>{getDatetime(parseTime(item.time))}</Text>,
        奖项: <Text center>{item.rewardName}</Text>,
      }))}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
    />
  );
}

export default function LotteryRewardRecordViewer() {
  return (
    <Column>
      <TextInput
        label="用户个人主页链接"
        value={userURL}
        onEnter={handleQuery}
      />
      <RewardsFliter />
      <Tooltip tooltip="受简书接口限制，我们无法获取这两种奖品的中奖情况，故无法进行查询">
        关于免费开 1 次连载 / 锦鲤头像框
      </Tooltip>
      <PrimaryButton onClick={handleQuery} loading={isLoading.value} fullWidth>
        查询
      </PrimaryButton>

      {result.value !== undefined &&
        (result.value.length !== 0 ? (
          <ResultTable />
        ) : (
          <NoResultNotice message="无中奖记录" />
        ))}
    </Column>
  );
}
