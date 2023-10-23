import { batch, computed, signal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  FieldBlock,
  GhostButton,
  Grid,
  InfoAlert,
  NoResultNotice,
  PrimaryButton,
  Switch,
  Text,
} from "@sscreator/ui";
import SSAutocomplete from "../components/SSAutocomplete";
import SSLazyLoadTable from "../components/SSLazyLoadTable";
import type {
  OnRankRecordItem,
  OnRankRecordsRequest,
  OnRankRecordsResponse,
  RankingSummaryRequest,
  RankingSummaryResponse,
} from "../models/OnRankArticleViewer/OnRankRecords";
import type {
  SameURLRecordsSummaryRequest,
  SameURLRecordsSummaryResponse,
} from "../models/OnRankArticleViewer/SameURLRecordsSummary";
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
const sameURLRecordsSummary = signal<Record<string, number> | undefined>(
  undefined,
);
const sameURLUserURL = signal<string | undefined>(undefined);

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
    toastWarning({ message: "请输入用户昵称或个人主页链接" });
    return;
  }

  hasMore.value = true;

  const isName = !isURL(userURLOrUserName.value);

  const requestBodyForRecords: OnRankRecordsRequest = isName
    ? {
        user_name: userURLOrUserName.value.trim(),
        sort_by: sortBy.value,
        sort_order: sortOrder.value,
        offset: 0,
      }
    : {
        user_url: userURLOrUserName.value,
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

  const requestBodyForRankingSummary: RankingSummaryRequest = isName
    ? {
        user_name: userURLOrUserName.value.trim(),
      }
    : {
        user_url: userURLOrUserName.value,
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

  if (isName) {
    fetchData<SameURLRecordsSummaryRequest, SameURLRecordsSummaryResponse>(
      "GET",
      "/tools/on_rank_article_viewer/same_url_records_summary",
      { user_name: userURLOrUserName.value.trim() },
      (data) => {
        batch(() => {
          sameURLRecordsSummary.value = data.records;
          sameURLUserURL.value = data.user_url;
        });
      },
      commonAPIErrorHandler,
    );
  }
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

function SameURLRecordsFoundNotice() {
  return (
    <InfoAlert>
      <Column>
        <Text large bold>
          数据不完整
        </Text>
        <Text>您可能更改过简书昵称，我们找到了其它与您有关的上榜记录：</Text>
        <Column gap="gap-2">
          {Object.entries(sameURLRecordsSummary.value!).map(
            ([name, dataCount]) => (
              <Text>
                {name}：{dataCount} 条上榜记录
              </Text>
            ),
          )}
        </Column>
      </Column>

      <GhostButton
        onClick={() => {
          batch(() => {
            // 替换当前输入的昵称为个人主页链接，同时清空同链接记录数据，以隐藏该组件
            userURLOrUserName.value = sameURLUserURL.value!;
            sameURLRecordsSummary.value = undefined;
            sameURLUserURL.value = undefined;
          });
          // 触发检索
          handleQuery();
        }}
        fullWidth
      >
        查看完整数据
      </GhostButton>
    </InfoAlert>
  );
}

function ResultTable() {
  return (
    <SSLazyLoadTable
      data={result.value!.map((item) => ({
        日期: <Text center>{getDate(parseTime(item.date))}</Text>,
        排名: <Text center>{item.ranking}</Text>,
        文章: (
          <ExternalLink
            className="block max-w-[60vw] overflow-hidden text-ellipsis whitespace-nowrap"
            href={item.url}
            hideIcon
          >
            {item.title}
          </ExternalLink>
        ),
        获钻量: <Text center>{item.FP_reward_count}</Text>,
      }))}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
    />
  );
}

export default function OnRankArticleViewer() {
  return (
    <Column>
      <SSAutocomplete
        label="用户昵称 / 个人主页链接"
        value={userURLOrUserName}
        onEnter={handleQuery}
        onValueChange={handleCompleteItemUpdate}
        completeItems={completeItems}
      />
      <Switch
        label="排序依据"
        value={sortSelect}
        data={[
          {
            label: "上榜日期（倒序）",
            value: "onrank_date desc",
          },
          {
            label: "上榜日期（正序）",
            value: "onrank_date asc",
          },
          {
            label: "排名（倒序）",
            value: "ranking desc",
          },
          {
            label: "排名（倒序）",
            value: "ranking asc",
          },
        ]}
      />
      <PrimaryButton onClick={handleQuery} loading={isLoading.value} fullWidth>
        查询
      </PrimaryButton>

      {sameURLRecordsSummary.value !== undefined &&
        Object.keys(sameURLRecordsSummary.value).length !== 0 &&
        sameURLUserURL.value !== undefined && <SameURLRecordsFoundNotice />}

      {top10Count.value !== undefined &&
        top30Count.value !== undefined &&
        top50Count.value !== undefined &&
        totalCount.value !== undefined &&
        totalCount.value !== 0 && (
          <Grid className="place-items-center" cols="grid-cols-2" gap="gap-6">
            <FieldBlock fieldName="前 10 名次数">
              <Text large bold>
                {top10Count.value}
              </Text>
            </FieldBlock>
            <FieldBlock fieldName="前 30 名次数">
              <Text large bold>
                {top30Count.value}
              </Text>
            </FieldBlock>
            <FieldBlock fieldName="前 50 名次数">
              <Text large bold>
                {top50Count.value}
              </Text>
            </FieldBlock>
            <FieldBlock fieldName="总上榜次数">
              <Text large bold>
                {totalCount.value}
              </Text>
            </FieldBlock>
          </Grid>
        )}

      {result.value !== undefined &&
        (result.value.length !== 0 ? (
          <ResultTable />
        ) : (
          <NoResultNotice message="没有上榜记录" />
        ))}
    </Column>
  );
}
