import {
  Button,
  Center,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { signal } from "@preact/signals";
import JMFAutocomplete from "../components/JMFAutocomplete";
import JMFLink from "../components/JMFLink";
import {
  OnRankRecordItem,
  OnRankRecordsRequest,
  OnRankRecordsResponse,
} from "../models/OnRankArticleViewer/OnRankRecords";
import {
  UserNameAutocompleteRequest,
  UserNameAutocompleteResponse,
} from "../models/OnRankArticleViewer/UserNameAutocomplete";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { getDate } from "../utils/timeHelper";

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

  try {
    fetchData<UserNameAutocompleteRequest, UserNameAutocompleteResponse>(
      "POST",
      "/tools/on_rank_article_viewer/user_name_autocomplete",
      {
        name_part: value,
      },
      (data) => (completeItems.value = data.possible_names),
      commonAPIErrorHandler,
    );
  } catch {}
}

function handleQuery() {
  if (userURLOrUserName.value.length === 0) {
    notifications.show({
      message: "请输入用户昵称或个人主页链接",
      color: "blue",
    });
    return;
  }

  const requestBody: OnRankRecordsRequest = isURL(userURLOrUserName.value)
    ? { user_url: userURLOrUserName.value }
    : { user_name: userURLOrUserName.value };

  try {
    fetchData<OnRankRecordsRequest, OnRankRecordsResponse>(
      "POST",
      "/tools/on_rank_article_viewer/on_rank_records",
      requestBody,
      (data) => (result.value = data.records),
      commonAPIErrorHandler,
      hasResult,
      isLoading,
    );
  } catch {}
}

export default function OnRankArticleViewer() {
  return (
    <Stack>
      <JMFAutocomplete
        label="用户昵称 / 个人主页链接"
        value={userURLOrUserName}
        onValueChange={handleCompleteItemUpdate}
        completeItems={completeItems}
      />
      <Button onClick={handleQuery} loading={isLoading.value}>
        查询
      </Button>
      {hasResult.value
        && (result.value.length !== 0 ? (
          <Table captionSide="bottom">
            <thead>
              <tr>
                <th>日期</th>
                <th style={{ minWidth: "50px" }}>排名</th>
                <th>文章</th>
                <th>获钻量</th>
              </tr>
            </thead>
            <tbody>
              {result.value.map((item) => (
                <tr key={`${item.date.toString()}_${item.url}`}>
                  <td>{getDate(new Date(item.date * 1000))}</td>
                  <td>{item.ranking}</td>
                  <td>
                    <JMFLink
                      url={item.url}
                      label={item.title.length <= 30
                        ? item.title
                        : `${item.title.substring(0, 30)}...`}
                      isExternal
                    />
                  </td>
                  <td>{item.FP_reward_count}</td>
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
