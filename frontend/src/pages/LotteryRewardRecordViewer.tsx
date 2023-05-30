import {
  Button,
  Chip,
  Group,
  Skeleton,
  Stack,
  Text,
  Table,
  Center,
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
import { fetchData, fetchStatus } from "../utils";

const rewards = signal<string[]>([]);
const userURL = signal("");
const selectedRewards = signal<string[]>([]);
const isLoading = signal(false);
const hasResult = signal(false);
const result = signal<LotteryRecordItem[]>([]);

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

  batch(() => {
    isLoading.value = true;
    hasResult.value = false;
  });

  fetchData<LotteryRecordsRequest, LotteryRecordsResponse>(
    "POST",
    "/tools/lottery_reward_record_viewer/lottery_records",
    {
      user_url: userURL.value,
      target_rewards: selectedRewards.value,
    },
  ).then(({ status, data }) => {
    if (status === fetchStatus.OK) {
      batch(() => {
        isLoading.value = false;
        hasResult.value = true;
        result.value = data!.records;
      });
    }
  });
}

export default function LotteryRewardRecordViewer() {
  useEffect(() => {
    fetchData<{}, RewardResponse>(
      "GET",
      "/tools/lottery_reward_record_viewer/rewards",
      {},
    ).then(({ status, data }) => {
      if (status === fetchStatus.OK) {
        batch(() => {
          rewards.value = data!.rewards;
          selectedRewards.value = data!.rewards.map((item) =>
            item.replace(" ", ""),
          );
        });
      } else {
        isLoading.value = false;
      }
    });
  }, []);

  return (
    <Stack>
      <JMFTextInput label="用户个人主页链接" value={userURL} />
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
                <Chip value={item.replace(" ", "")}>{item}</Chip>
              ))}
            </Group>
          </Chip.Group>
        </>
      ) : (
        <Skeleton height={64} />
      )}
      {isLoading.value ? (
        <Button loading fullWidth>
          查询
        </Button>
      ) : (
        <Button onClick={handleQuery} fullWidth>
          查询
        </Button>
      )}
      {hasResult.value &&
        (result.value.length !== 0 ? (
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
                  <th>{new Date(item.time * 1000).toLocaleString()}</th>
                  <th>{item.reward_name}</th>
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
