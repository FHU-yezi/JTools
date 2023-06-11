import {
  Button,
  Center,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { signal } from "@preact/signals";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
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
const resultTableSortStatus = signal<DataTableSortStatus>({ columnAccessor: "date", direction: "desc" });

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
      "GET",
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

function handleResultTableSort() {
  const sortKey = resultTableSortStatus.value.columnAccessor;
  const sortDirection = resultTableSortStatus.value.direction;
  const resultToSort = result.value;

  function processSortKey(key: number) {
    const sortKeyProcessResult = Date.parse(key.toString());
    if (!Number.isNaN(sortKeyProcessResult)) {
      return sortKeyProcessResult;
    }
    return key;
  }

  resultToSort.sort(
    (a: Record<string, any>, b: Record<string, any>) => (
      processSortKey(a[sortKey]) - processSortKey(b[sortKey])
    ),
  );

  if (sortDirection === "desc") {
    result.value = resultToSort.reverse();
  } else {
    result.value = resultToSort;
  }
}

function ResultTable() {
  return (
    <DataTable
      records={result.value}
      columns={[
        {
          accessor: "date",
          title: "日期",
          sortable: true,
          noWrap: true,
          render: (record) => (getDate(new Date(record.date * 1000))),
        },
        {
          accessor: "ranking",
          title: "排名",
          noWrap: true,
          sortable: true,
        },
        {
          accessor: "title",
          title: "文章",
          render: (record) => (
            <JMFLink
              url={record.url}
              label={record.title.length <= 30
                ? record.title
                : `${record.title.substring(0, 30)}...`}
              isExternal
            />
          ),
        },
        {
          accessor: "FP_reward_count",
          title: "获钻量",
          noWrap: true,
          sortable: true,
        },
      ]}
      sortStatus={resultTableSortStatus.value}
      onSortStatusChange={
        (newStatus) => { resultTableSortStatus.value = newStatus; handleResultTableSort(); }
      }
    />
  );
}

export default function OnRankArticleViewer() {
  return (
    <Stack>
      <JMFAutocomplete
        label="用户昵称 / 个人主页链接"
        value={userURLOrUserName}
        onEnter={handleQuery}
        onValueChange={handleCompleteItemUpdate}
        completeItems={completeItems}
      />
      <Button onClick={handleQuery} loading={isLoading.value}>
        查询
      </Button>
      {hasResult.value
        && (result.value.length !== 0 ? (
          <ResultTable />
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
