import {
  Button,
  Center,
  Stack,
  Table,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { batch, signal } from "@preact/signals";
import JMFAutocomplete from "../components/JMFAutocomplete";
import {
  OnRankRecordItem,
  OnRankRecordsRequest,
  OnRankRecordsResponse,
} from "../models/OnRankArticleViewer/OnRankRecords";
import {
  UserNameAutocompleteRequest,
  UserNameAutocompleteResponse,
} from "../models/OnRankArticleViewer/UserNameAutocomplete";
import { fetchData, fetchStatus } from "../utils";

const userURLOrUserName = signal("");
const completeItems = signal<string[]>([]);
const isLoading = signal(false);
const hasResult = signal(false);
const result = signal<OnRankRecordItem[]>([]);

function isURL(string: string): boolean {
  return string.startsWith("https://");
}

function handleCompleteItemUpdate(value: string) {
  if (value.length === 0 || value.length > 15) {
    return;
  }
  if (isURL(value)) {
    return;
  }

  fetchData<UserNameAutocompleteRequest, UserNameAutocompleteResponse>(
    "POST",
    "/tools/on_rank_article_viewer/user_name_autocomplete",
    { name_part: value },
  ).then(({ status, data }) => {
    if (status === fetchStatus.OK) {
      completeItems.value = data!.possible_names;
    }
  });
}

function handleQuery() {
  if (userURLOrUserName.value.length === 0) {
    notifications.show({
      message: "请输入用户昵称或个人主页链接",
      color: "blue",
    });
    return;
  }

  batch(() => {
    isLoading.value = true;
    hasResult.value = false;
  });

  const requestBody: OnRankRecordsRequest = isURL(userURLOrUserName.value)
    ? { user_url: userURLOrUserName.value }
    : { user_name: userURLOrUserName.value };

  fetchData<OnRankRecordsRequest, OnRankRecordsResponse>(
    "POST",
    "/tools/on_rank_article_viewer/on_rank_records",
    requestBody,
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

export default function OnRankArticleViewer() {
  const theme = useMantineTheme();

  return (
    <Stack>
      <JMFAutocomplete
        label="用户昵称 / 个人主页链接"
        value={userURLOrUserName}
        onValueChange={handleCompleteItemUpdate}
        completeItems={completeItems}
      />
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
                <th>日期</th>
                <th style={{ "min-width": "50px" }}>排名</th>
                <th>文章</th>
                <th>获钻量</th>
              </tr>
            </thead>
            <tbody>
              {result.value.map((item) => (
                <tr>
                  <th>{new Date(item.date * 1000).toLocaleDateString()}</th>
                  <th>{item.ranking}</th>
                  <th>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: theme.colors.blue[6],
                        "text-decoration": "none"
                      }}
                    >
                      {item.title}
                    </a>
                  </th>
                  <th>{item.FP_reward_count}</th>
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
