import { batch, computed, signal } from "@preact/signals";
import SSAutocomplete from "../components/SSAutocomplete";
import SSButton from "../components/SSButton";
import SSExternalLink from "../components/SSExternalLink";
import SSLazyLoadTable from "../components/SSLazyLoadTable";
import SSSegmentedControl from "../components/SSSegmentedControl";
import SSStat from "../components/SSStat";
import SSText from "../components/SSText";
import type {
  OnRankRecordItem,
  OnRankRecordsRequest,
  OnRankRecordsResponse,
  RankingSummaryRequest,
  RankingSummaryResponse,
} from "../models/OnRankArticleViewer/OnRankRecords";
import type {
  UserNameAutocompleteRequest,
  UserNameAutocompleteResponse,
} from "../models/OnRankArticleViewer/UserNameAutocomplete";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { getDate, parseTime } from "../utils/timeHelper";
import { toastWarning } from "../utils/toastHelper";

const userURLOrUserName = signal("");
const sortSelect = signal<
  "onrank_date desc" | "onrank_date asc" | "ranking desc" | "ranking asc"
>("onrank_date desc");
const sortBy = computed<"onrank_date" | "ranking">(
  () => sortSelect.value.split(" ")[0] as any,
);
const sortOrder = computed<"asc" | "desc">(
  () => sortSelect.value.split(" ")[1] as any,
);
const completeItems = signal<string[]>([]);
const isLoading = signal(false);
const hasMore = signal(true);
const result = signal<OnRankRecordItem[] | undefined>(undefined);
const top10Count = signal<number | undefined>(undefined);
const top30Count = signal<number | undefined>(undefined);
const top50Count = signal<number | undefined>(undefined);
const totalCount = signal<number | undefined>(undefined);

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
    commonAPIErrorHandler,
  );
}

function handleQuery() {
  if (userURLOrUserName.value.length === 0) {
    toastWarning("请输入用户昵称或个人主页链接");
    return;
  }

  hasMore.value = true;

  const requestBodyForRecords: OnRankRecordsRequest = isURL(
    userURLOrUserName.value,
  )
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
    requestBodyForRecords,
    (data) => {
      batch(() => {
        result.value = data.records;
        if (data.records.length === 0) {
          hasMore.value = false;
        }
      });
    },
    commonAPIErrorHandler,
    isLoading,
  );

  const requestBodyForRankingSummary: RankingSummaryRequest = isURL(
    userURLOrUserName.value,
  )
    ? {
        user_url: userURLOrUserName.value,
      }
    : {
        user_name: userURLOrUserName.value.trim(),
      };

  fetchData<RankingSummaryRequest, RankingSummaryResponse>(
    "POST",
    "/tools/on_rank_article_viewer/ranking_summary",
    requestBodyForRankingSummary,
    (data) => {
      batch(() => {
        top10Count.value = data.top10_count;
        top30Count.value = data.top30_count;
        top50Count.value = data.top50_count;
        totalCount.value = data.total;
      });
    },
    commonAPIErrorHandler,
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
    isLoading,
  );
}

function ResultTable() {
  return (
    <SSLazyLoadTable
      data={result.value!.map((item) => ({
        日期: <SSText center>{getDate(parseTime(item.date))}</SSText>,
        排名: <SSText center>{item.ranking}</SSText>,
        文章: (
          <SSExternalLink
            className="block max-w-[60vw] overflow-hidden text-ellipsis whitespace-nowrap"
            url={item.url}
            label={item.title}
            openInNewTab
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
        compact
      />
      <SSButton onClick={handleQuery} loading={isLoading.value}>
        查询
      </SSButton>

      {top10Count.value !== undefined &&
        top30Count.value !== undefined &&
        top50Count.value !== undefined &&
        totalCount.value !== undefined && (
          <div className="grid grid-cols-2 place-items-center gap-6">
            <SSStat title="前 10 名次数" value={top10Count.value} />
            <SSStat title="前 30 名次数" value={top30Count.value} />
            <SSStat title="前 50 名次数" value={top50Count.value} />
            <SSStat title="总上榜次数" value={totalCount.value} />
          </div>
        )}

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
