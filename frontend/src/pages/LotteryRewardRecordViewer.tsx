import {
  Button,
  Center,
  Chip,
  Group,
  Skeleton,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { batch, signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import JMFTextInput from "../components/JMFTextInput";
import {
  LotteryRecordItem,
  LotteryRecordsRequest,
  LotteryRecordsResponse,
} from "../models/LotteryRewardRecordViewer/LotteryRecords";
import { RewardResponse } from "../models/LotteryRewardRecordViewer/Rewards";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { replaceAll } from "../utils/textHelper";
import { getDatetime, parseTime } from "../utils/timeHelper";

const rewards = signal<string[]>([]);
const userURL = signal("");
const selectedRewards = signal<string[]>([]);
const hasResult = signal(false);
const isLoading = signal(false);
const result = signal<LotteryRecordItem[]>([]);

function handleQuery() {
  if (userURL.value.length === 0) {
    notifications.show({
      message: "请输入用户个人主页链接",
      color: "blue",
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
      },
      (data) => (result.value = data.records),
      commonAPIErrorHandler,
      hasResult,
      isLoading,
    );
  } catch {}
}

export default function LotteryRewardRecordViewer() {
  useEffect(() => {
    try {
      fetchData<Record<string, never>, RewardResponse>(
        "GET",
        "/tools/lottery_reward_record_viewer/rewards",
        {},
        (data) => batch(() => {
          rewards.value = data.rewards;
          selectedRewards.value = data.rewards.map((item) => replaceAll(item, " ", ""));
        }),
        commonAPIErrorHandler,
      );
    } catch {}
  }, []);

  return (
    <Stack>
      <JMFTextInput label="用户个人主页链接" value={userURL} onEnter={handleQuery} />
      {rewards.value.length !== 0 ? (
        <>
          <Text fw={600}>奖项筛选</Text>
          <Chip.Group
            value={selectedRewards.value}
            onChange={(value) => (selectedRewards.value = value)}
            multiple
          >
            <Group>
              {rewards.value.map((item) => (
                <Chip key={replaceAll(item, " ", "")} value={replaceAll(item, " ", "")}>{item}</Chip>
              ))}
            </Group>
          </Chip.Group>
        </>
      ) : (
        <Skeleton height={64} />
      )}
      <Button onClick={handleQuery} loading={isLoading.value}>
        查询
      </Button>
      {hasResult.value
        && (result.value.length !== 0 ? (
          <Table captionSide="bottom">
            <thead>
              <tr>
                <th>时间</th>
                <th>奖项</th>
              </tr>
            </thead>
            <tbody>
              {result.value.map((item) => (
                <tr key={item.time}>
                  <td>{getDatetime(parseTime(item.time))}</td>
                  <td>{item.reward_name}</td>
                </tr>
              ))}
            </tbody>
            {result.value.length === 100 && (
              <caption>仅展示距现在最近的 100 条结果</caption>
            )}
          </Table>
        ) : (
          <Center>
            <Text fw={600} m={24} size="lg">
              没有查询到数据
            </Text>
          </Center>
        ))}
    </Stack>
  );
}
