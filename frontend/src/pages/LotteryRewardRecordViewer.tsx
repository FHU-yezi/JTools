import { computed, signal, useSignal } from "@preact/signals";
import {
  CheckboxGroup,
  InfiniteScroll,
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
import { useRewards } from "../models/lottery";
import {
  useLotteryWinRecords,
  type GetLotteryWinRecordsResponse,
} from "../models/users";
import { userUrlToSlug } from "../utils/jianshuHelper";
import { getDatetime, parseTime } from "../utils/timeHelper";

const userUrl = signal("");
const userSlug = computed(() => userUrlToSlug(userUrl.value));
const excludedAwards = signal<string[]>([]);

function handleQuery(trigger: () => void) {
  if (!userSlug.value) {
    toastWarning("请输入有效的用户个人主页链接");
    return;
  }

  trigger();
}

function RewardsFilter() {
  const { data: rewards, isLoading: isRewardsLoading } = useRewards();
  const selectedRewards = useSignal<Array<string>>([]);

  useEffect(() => {
    if (!isRewardsLoading) {
      selectedRewards.value = rewards!.rewards;
    }
  }, [isRewardsLoading]);

  useEffect(() => {
    if (!rewards) {
      excludedAwards.value = [];
      return;
    }

    excludedAwards.value = rewards.rewards.filter(
      (item) => !selectedRewards.value.includes(item),
    );
  }, [selectedRewards.value]);

  return (
    <LoadingArea className="h-[56px]" loading={!rewards}>
      <CheckboxGroup
        id="rewards"
        className="flex flex-wrap gap-x-4 gap-y-2"
        label="奖项筛选"
        value={selectedRewards}
        options={
          !rewards
            ? []
            : rewards.rewards.map((item) => ({
                label: item,
                value: item,
              }))
        }
      />
    </LoadingArea>
  );
}

function Result({
  lotteryWinRecords,
  isLoading,
  onLoadMore,
}: {
  lotteryWinRecords?: GetLotteryWinRecordsResponse[];
  isLoading: boolean;
  onLoadMore: () => void;
}) {
  if (!lotteryWinRecords || !lotteryWinRecords.length) return null;

  if (!lotteryWinRecords[0].records.length) {
    return <LargeText className="text-center">无中奖记录</LargeText>;
  }

  const flattedRecords = lotteryWinRecords.flatMap((page) => page.records);

  return (
    <InfiniteScroll onLoadMore={onLoadMore} hasMore isLoading={isLoading}>
      <Table className="w-full whitespace-nowrap text-center">
        <TableHeader>
          <TableHead>时间</TableHead>
          <TableHead>奖项</TableHead>
        </TableHeader>
        <TableBody>
          {flattedRecords.map((item) => (
            <TableRow key={item.time}>
              <TableCell>{getDatetime(parseTime(item.time))}</TableCell>
              <TableCell>{item.rewardName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </InfiniteScroll>
  );
}

export default function LotteryRewardRecordViewer() {
  const {
    data: lotteryWinRecords,
    isLoading,
    nextPage,
    trigger,
    reset,
  } = useLotteryWinRecords({
    userSlug: userSlug.value!,
    excluded_awards: excludedAwards.value,
  });

  useEffect(() => {
    reset();
  }, [userUrl.value, excludedAwards.value]);

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
      <RewardsFilter />
      <SmallText color="gray">
        受简书接口限制，本工具数据不包括免费开 1 次连载与锦鲤头像框
      </SmallText>
      <SolidButton
        onClick={() => handleQuery(trigger)}
        loading={isLoading}
        fullWidth
      >
        查询
      </SolidButton>

      <Result
        lotteryWinRecords={lotteryWinRecords}
        isLoading={isLoading}
        onLoadMore={nextPage}
      />
    </>
  );
}
