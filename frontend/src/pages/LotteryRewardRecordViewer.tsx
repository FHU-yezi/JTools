import type { Signal } from "@preact/signals";
import { batch, computed, effect, signal, useSignal } from "@preact/signals";
import {
  Checkbox,
  Column,
  Grid,
  LargeText,
  LoadingArea,
  SmallText,
  SolidButton,
  Text,
  TextInput,
} from "@sscreator/ui";
import { useEffect } from "preact/hooks";
import LazyLoadTable from "../components/LazyLoadTable";
import type { GetRewardsResponse } from "../models/lottery";
import type {
  GetLotteryWinRecordItem,
  GetLotteryWinRecordsRequest,
  GetLotteryWinRecordsResponse,
} from "../models/users";
import { userUrlToSlug } from "../utils/jianshuHelper";
import { sendRequest } from "../utils/sendRequest";
import { getDatetime, parseTime } from "../utils/timeHelper";
import { toastWarning } from "../utils/toastHelper";

const userUrl = signal("");
const userSlug = computed(() => userUrlToSlug(userUrl.value));
const rewards = signal<string[] | undefined>(undefined);
const excludedAwards = signal<string[]>([]);
const isLoading = signal(false);
const hasMore = signal(true);
const result = signal<GetLotteryWinRecordItem[] | undefined>(undefined);

function handleQuery() {
  if (userSlug.value === undefined) {
    toastWarning({ message: "请输入有效的用户个人主页链接" });
    return;
  }

  sendRequest<GetLotteryWinRecordsRequest, GetLotteryWinRecordsResponse>({
    method: "GET",
    endpoint: `/v1/users/${userSlug.value}/lottery-win-records`,
    queryArgs: {
      excluded_awards: excludedAwards.value,
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
  if (userSlug.value === undefined) {
    toastWarning({ message: "请输入有效的用户个人主页链接" });
    return;
  }

  sendRequest<GetLotteryWinRecordsRequest, GetLotteryWinRecordsResponse>({
    method: "GET",
    endpoint: `/v1/users/${userSlug.value}/lottery-win-records`,
    queryArgs: {
      excluded_awards: excludedAwards.value,
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
          rewards.value.forEach(
            (name) => (rewardSelectedSignals.value[name] = signal(true)),
          );
          dataReady.value = true;
        }),
    });
  }, []);

  effect(
    () =>
      (excludedAwards.value = Object.keys(rewardSelectedSignals.value).filter(
        (name) => rewardSelectedSignals.value[name].value === false,
      )),
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
                <Checkbox id={name} label={name} value={value} />
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
    <LazyLoadTable
      data={result.value!.map((item) => ({
        时间: (
          <Text className="text-center">
            {getDatetime(parseTime(item.time))}
          </Text>
        ),
        奖项: <Text className="text-center">{item.rewardName}</Text>,
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
        id="user-url"
        label="用户个人主页链接"
        value={userUrl}
        onEnter={handleQuery}
      />
      <RewardsFliter />
      <SmallText colorScheme="gray">
        受简书接口限制，本工具数据不包括免费开 1 次连载与锦鲤头像框
      </SmallText>
      <SolidButton onClick={handleQuery} loading={isLoading.value} fullWidth>
        查询
      </SolidButton>

      {result.value !== undefined &&
        (result.value.length !== 0 ? (
          <ResultTable />
        ) : (
          <LargeText>无中奖记录</LargeText>
        ))}
    </Column>
  );
}
