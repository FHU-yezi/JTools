import { Button, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { signal } from "@preact/signals";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import SSAutocomplete from "../components/SSAutocomplete";
import SSLink from "../components/SSLink";
import SSText from "../components/SSText";
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
import { getDate, parseTime } from "../utils/timeHelper";

const PAGE_SIZE = 50;

const userURLOrUserName = signal("");
const completeItems = signal<string[]>([]);
const isLoading = signal(false);
const hasResult = signal(false);
const result = signal<OnRankRecordItem[]>([]);
const resultTotalCount = signal<number | undefined>(undefined);
const currentPage = signal(1);
const resultTableSortStatus = signal<DataTableSortStatus>({
  columnAccessor: "date",
  direction: "desc",
});

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
        name_part: value.trim(),
      },
      (data) => (completeItems.value = data.possible_names),
      commonAPIErrorHandler
    );
  } catch {}
}

function handleQuery(offset: number) {
  if (userURLOrUserName.value.length === 0) {
    notifications.show({
      message: "请输入用户昵称或个人主页链接",
      color: "blue",
    });
    return;
  }

  const requestBody: OnRankRecordsRequest = isURL(userURLOrUserName.value)
    ? { user_url: userURLOrUserName.value, offset }
    : { user_name: userURLOrUserName.value.trim(), offset };

  try {
    fetchData<OnRankRecordsRequest, OnRankRecordsResponse>(
      "POST",
      "/tools/on_rank_article_viewer/on_rank_records",
      requestBody,
      (data) => {
        result.value = data.records;
        resultTotalCount.value = data.total;
      },
      commonAPIErrorHandler,
      result.value.length === 0 ? hasResult : undefined,
      result.value.length === 0 ? isLoading : undefined
    );
  } catch {}
}

function handleResultTableSort() {
  const sortKey = resultTableSortStatus.value.columnAccessor;
  const sortDirection = resultTableSortStatus.value.direction;
  let resultToSort = result.value;

  resultToSort = resultToSort.map((item) => {
    item.date = parseTime(item.date).getTime();
    return item;
  });

  resultToSort.sort(
    (a: Record<string, any>, b: Record<string, any>) => a[sortKey] - b[sortKey]
  );

  resultToSort = resultToSort.map((item) => {
    item.date = new Date(item.date).getTime() / 1000;
    return item;
  });

  if (sortDirection === "desc") {
    result.value = resultToSort.reverse();
  } else {
    result.value = resultToSort;
  }
}

function ResultTable() {
  return (
    <DataTable
      height={600}
      records={result.value}
      columns={[
        {
          accessor: "date",
          title: "日期",
          sortable: true,
          noWrap: true,
          render: (record) => getDate(parseTime(record.date)),
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
            <SSLink
              url={record.url}
              label={
                record.title.length <= 30
                  ? record.title
                  : `${record.title.substring(0, 30)}...`
              }
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
      onSortStatusChange={(newStatus) => {
        resultTableSortStatus.value = newStatus;
        handleResultTableSort();
      }}
      totalRecords={resultTotalCount.value}
      recordsPerPage={PAGE_SIZE}
      page={currentPage.value}
      onPageChange={(page) => {
        handleQuery((page - 1) * PAGE_SIZE);
        currentPage.value = page;
      }}
    />
  );
}

export default function OnRankArticleViewer() {
  return (
    <Stack>
      <SSAutocomplete
        label="用户昵称 / 个人主页链接"
        value={userURLOrUserName}
        onEnter={() => handleQuery(0)}
        onValueChange={handleCompleteItemUpdate}
        completeItems={completeItems}
      />
      <Button onClick={() => handleQuery(0)} loading={isLoading.value}>
        查询
      </Button>
      {hasResult.value &&
        (result.value.length !== 0 ? (
          <Stack>
            <ResultTable />
          </Stack>
        ) : (
          <SSText className="m-6" large bold center>
            没有查询到数据
          </SSText>
        ))}
    </Stack>
  );
}
