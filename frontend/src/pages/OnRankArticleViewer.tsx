import { computed, signal } from "@preact/signals";
import toast from "react-hot-toast";
import SSAutocomplete from "../components/SSAutocomplete";
import SSButton from "../components/SSButton";
import SSLazyLoadTable from "../components/SSLazyLoadTable";
import SSLink from "../components/SSLink";
import SSSegmentedControl from "../components/SSSegmentedControl";
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

const userURLOrUserName = signal("");
const sortSelect = signal<
  "onrank_date desc" | "onrank_date asc" | "ranking desc" | "ranking asc"
>("onrank_date desc");
const sortBy = computed<"onrank_date" | "ranking">(
  () => sortSelect.value.split(" ")[0] as any
);
const sortOrder = computed<"asc" | "desc">(
  () => sortSelect.value.split(" ")[1] as any
);
const completeItems = signal<string[]>([]);
const isLoading = signal(false);
const hasMore = signal(true);
const result = signal<OnRankRecordItem[] | undefined>(undefined);

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
    "GET",
    "/tools/on_rank_article_viewer/user_name_autocomplete",
    {
      name_part: value.trim(),
    },
    (data) => (completeItems.value = data.possible_names),
    commonAPIErrorHandler
  );
}

function handleQuery() {
  if (userURLOrUserName.value.length === 0) {
    toast("请输入用户昵称或个人主页链接", {
      icon: " ⚠️",
    });
    return;
  }

  const requestBody: OnRankRecordsRequest = isURL(userURLOrUserName.value)
    ? {
        user_url: userURLOrUserName.value,
        sort_by: sortBy.value,
        sort_order: sortOrder.value,
        offset: 0,
      }
    : {
        user_name: userURLOrUserName.value.trim(),
        sort_by: sortBy.value,
        sort_order: sortOrder.value,
        offset: 0,
      };

  fetchData<OnRankRecordsRequest, OnRankRecordsResponse>(
    "POST",
    "/tools/on_rank_article_viewer/on_rank_records",
    requestBody,
    (data) => {
      result.value = data.records;
      if (data.records.length === 0) {
        hasMore.value = false;
      }
    },
    commonAPIErrorHandler,
    isLoading
  );
}

function handleLoadMore() {
  const requestBody: OnRankRecordsRequest = isURL(userURLOrUserName.value)
    ? {
        user_url: userURLOrUserName.value,
        sort_by: sortBy.value,
        sort_order: sortOrder.value,
        offset: result.value!.length + 1,
      }
    : {
        user_name: userURLOrUserName.value.trim(),
        sort_by: sortBy.value,
        sort_order: sortOrder.value,
        offset: result.value!.length + 1,
      };

  fetchData<OnRankRecordsRequest, OnRankRecordsResponse>(
    "POST",
    "/tools/on_rank_article_viewer/on_rank_records",
    requestBody,
    (data) => {
      result.value = result.value!.concat(data.records);
      if (data.records.length === 0) {
        hasMore.value = false;
      }
    },
    commonAPIErrorHandler,
    isLoading
  );
}

function ResultTable() {
  return (
    <SSLazyLoadTable
      data={result.value!.map((item) => ({
        日期: <SSText center>{getDate(parseTime(item.date))}</SSText>,
        排名: <SSText center>{item.ranking}</SSText>,
        文章: (
          <SSLink
            className="block max-w-[60vw] overflow-hidden text-ellipsis whitespace-nowrap"
            url={item.url}
            label={item.title}
            isExternal
            hideIcon
          />
        ),
        获钻量: <SSText center>{item.FP_reward_count}</SSText>,
      }))}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
    />
  );
}

export default function OnRankArticleViewer() {
  return (
    <div className="flex flex-col gap-4">
      <SSAutocomplete
        label="用户昵称 / 个人主页链接"
        value={userURLOrUserName}
        onEnter={handleQuery}
        onValueChange={handleCompleteItemUpdate}
        completeItems={completeItems}
      />
      <SSSegmentedControl
        label="排序依据"
        value={sortSelect}
        data={{
          "上榜日期（倒序）": "onrank_date desc",
          "上榜日期（正序）": "onrank_date asc",
          "排名（倒序）": "ranking desc",
          "排名（正序）": "ranking asc",
        }}
      />
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
