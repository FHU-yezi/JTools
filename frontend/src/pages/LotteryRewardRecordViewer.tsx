import {
  batch,
  computed,
  signal,
  useSignal,
  useSignalEffect,
} from "@preact/signals";
import {
  CheckboxGroup,
  Column,
  InfiniteScrollTable,
  LargeText,
  LoadingArea,
  SmallText,
  SolidButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TextInput,
  toastWarning,
} from "@sscreator/ui";
import { useEffect } from "preact/hooks";
import type { GetRewardsResponse } from "../models/lottery";
import type {
  GetLotteryWinRecordItem,
  GetLotteryWinRecordsRequest,
  GetLotteryWinRecordsResponse,
} from "../models/users";
import { userUrlToSlug } from "../utils/jianshuHelper";
import { sendRequest } from "../utils/sendRequest";
import { getDatetime, parseTime } from "../utils/timeHelper";

const userUrl = signal("");
const userSlug = computed(() => userUrlToSlug(userUrl.value));

const excludedAwards = signal<string[]>([]);
const isLoading = signal(false);
const hasMore = signal(true);
const lotteryWinRecords = signal<GetLotteryWinRecordItem[] | undefined>(
  undefined,
);

function handleQuery() {
  if (!userSlug.value) {
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
        lotteryWinRecords.value = data.records;
        if (data.records.length === 0) {
          hasMore.value = false;
        }
      }),
    isLoading,
  });
}

function handleLoadMore() {
  if (!userSlug.value) {
    toastWarning({ message: "请输入有效的用户个人主页链接" });
    return;
  }

  sendRequest<GetLotteryWinRecordsRequest, GetLotteryWinRecordsResponse>({
    method: "GET",
    endpoint: `/v1/users/${userSlug.value}/lottery-win-records`,
    queryArgs: {
      excluded_awards: excludedAwards.value,
      offset: lotteryWinRecords.value!.length,
    },
    onSuccess: ({ data }) => {
      if (!data.records) {
        hasMore.value = false;
      } else {
        lotteryWinRecords.value = lotteryWinRecords.value!.concat(data.records);
      }
    },
    isLoading,
  });
}

function RewardsFliter() {
  const rewards = useSignal<GetRewardsResponse | null>(null);
  const selectedRewards = useSignal<Array<string>>([]);

  useEffect(() => {
    sendRequest<Record<string, never>, GetRewardsResponse>({
      method: "GET",
      endpoint: "/v1/lottery/rewards",
      onSuccess: ({ data }) => {
        rewards.value = data;
        selectedRewards.value = data.rewards;
      },
    });
  }, []);

  useSignalEffect(() => {
    if (!rewards.value) {
      excludedAwards.value = [];
      return;
    }

    excludedAwards.value = rewards.value.rewards.filter(
      (item) => !selectedRewards.value.includes(item),
    );
  });

  return (
    <LoadingArea className="h-[56px]" loading={!rewards.value}>
      <CheckboxGroup
        id="rewards"
        className="flex flex-wrap gap-x-4 gap-y-2"
        label="奖项筛选"
        value={selectedRewards}
        options={
          !rewards.value
            ? []
            : rewards.value.rewards.map((item) => ({
                label: item,
                value: item,
              }))
        }
      />
    </LoadingArea>
  );
}

function Result() {
  if (!lotteryWinRecords.value) {
    return null;
  }

  if (!lotteryWinRecords.value.length) {
    return <LargeText className="text-center">无中奖记录</LargeText>;
  }

  return (
    <InfiniteScrollTable
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
    >
      <Table className="w-full whitespace-nowrap text-center">
        <TableHeader>
          <TableHead>时间</TableHead>
          <TableHead>奖项</TableHead>
        </TableHeader>
        <TableBody>
          {lotteryWinRecords.value!.map((item) => (
            <TableRow key={item.time}>
              <TableCell>{getDatetime(parseTime(item.time))}</TableCell>
              <TableCell>{item.rewardName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </InfiniteScrollTable>
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

      <Result />
    </Column>
  );
}
