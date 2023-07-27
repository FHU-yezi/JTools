import { Signal, batch, effect, signal, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import toast from "react-hot-toast";
import SSButton from "../components/SSButton";
import SSCheckbox from "../components/SSCheckbox";
import SSLazyLoadTable from "../components/SSLazyLoadTable";
import SSSkeleton from "../components/SSSkeleton";
import SSText from "../components/SSText";
import SSTextInput from "../components/SSTextInput";
import SSTooltip from "../components/SSTooltip";
import {
  LotteryRecordItem,
  LotteryRecordsRequest,
  LotteryRecordsResponse,
} from "../models/LotteryRewardRecordViewer/LotteryRecords";
import { RewardResponse } from "../models/LotteryRewardRecordViewer/Rewards";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { removeSpace } from "../utils/textHelper";
import { getDatetime, parseTime } from "../utils/timeHelper";

const rewards = signal<string[] | undefined>(undefined);
const userURL = signal("");
const selectedRewards = signal<string[]>([]);
const isLoading = signal(false);
const hasMore = signal(true);
const result = signal<LotteryRecordItem[] | undefined>(undefined);

function handleQuery() {
  if (userURL.value.length === 0) {
    toast("请输入用户个人主页链接", {
      icon: " ⚠️",
    });
    return;
  }

  try {
    fetchData<LotteryRecordsRequest, LotteryRecordsResponse>(
      "POST",
      "/tools/lottery_reward_record_viewer/lottery_records",
      {
        user_url: userURL.value,
        target_rewards: selectedRewards.value,
        offset: 0,
      },
      (data) => {
        result.value = data.records;
        if (data.records.length === 0) {
          hasMore.value = false;
        }
      },
      commonAPIErrorHandler,
      isLoading
    );
  } catch {}
}

function handleLoadMore() {
  try {
    fetchData<LotteryRecordsRequest, LotteryRecordsResponse>(
      "POST",
      "/tools/lottery_reward_record_viewer/lottery_records",
      {
        user_url: userURL.value,
        target_rewards: selectedRewards.value,
        offset: result.value!.length + 1,
      },
      (data) => {
        result.value = result.value!.concat(data.records);
        if (data.records.length === 0) {
          hasMore.value = false;
        }
      },
      commonAPIErrorHandler,
      isLoading
    );
  } catch {}
}

function RewardsFliter() {
  const rewardSelectedSignals = useSignal<Record<string, Signal<boolean>>>({});
  const dataReady = useSignal(false);

  useEffect(() => {
    try {
      fetchData<Record<string, never>, RewardResponse>(
        "GET",
        "/tools/lottery_reward_record_viewer/rewards",
        {},
        (data) =>
          batch(() => {
            rewards.value = data.rewards;
            selectedRewards.value = rewards.value.map((item) =>
              removeSpace(item)
            );
            rewards.value.forEach(
              (name) => (rewardSelectedSignals.value[name] = signal(true))
            );
            dataReady.value = true;
          }),
        commonAPIErrorHandler
      );
    } catch {}
  }, []);

  effect(
    () =>
      (selectedRewards.value = Object.keys(rewardSelectedSignals.value)
        .filter((name) => rewardSelectedSignals.value[name].value === true)
        .map((item) => removeSpace(item)))
  );

  return (
    <div>
      <SSText className="mb-1.5" bold>
        奖项筛选
      </SSText>
      {dataReady.value ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.entries(rewardSelectedSignals.value).map(([name, value]) => (
            <SSCheckbox label={name} value={value} />
          ))}
        </div>
      ) : (
        <SSSkeleton className="h-36 w-full sm:h-16" />
      )}
    </div>
  );
}

function ResultTable() {
  return (
    <SSLazyLoadTable
      data={result.value!.map((item) => ({
        时间: getDatetime(parseTime(item.time)),
        奖项: item.reward_name,
      }))}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
    />
  );
}

export default function LotteryRewardRecordViewer() {
  return (
    <div className="flex flex-col gap-4">
      <SSTextInput
        label="用户个人主页链接"
        value={userURL}
        onEnter={handleQuery}
      />
      <RewardsFliter />
      <SSTooltip tooltip="受简书接口限制，我们无法获取这两种奖品的中奖情况，故无法进行查询">
        关于免费开 1 次连载 / 锦鲤头像框
      </SSTooltip>
      <SSButton onClick={handleQuery} loading={isLoading.value}>
        查询
      </SSButton>

      {result.value !== undefined &&
        (result.value.length !== 0 ? (
          <ResultTable />
        ) : (
          <SSText className="m-6" bold large center>
            没有查询到数据
          </SSText>
        ))}
    </div>
  );
}
