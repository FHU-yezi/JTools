import { batch, computed, signal, useSignalEffect } from "@preact/signals";
import {
  AutoCompleteInput,
  Column,
  ExternalLink,
  Grid,
  LargeText,
  Notice,
  Select,
  SolidButton,
  Text,
} from "@sscreator/ui";
import LazyLoadTable from "../components/LazyLoadTable";
import type {
  GetHistoryNamesOnArticleRankSummaryResponse,
  GetNameAutocompleteRequest,
  GetNameAutocompleteResponse,
  GetOnArticleRankRecordItem,
  GetOnArticleRankRecordsRequest,
  GetOnArticleRankRecordsResponse,
  GetOnArticleRankSummaryResponse,
} from "../models/users";
import { userUrlToSlug } from "../utils/jianshuHelper";
import { sendRequest } from "../utils/sendRequest";
import { getDate, parseTime } from "../utils/timeHelper";
import { toastWarning } from "../utils/toastHelper";

const userUrlOrName = signal("");
const userSlug = computed(() => userUrlToSlug(userUrlOrName.value));
const userName = computed(() =>
  !userSlug.value && userUrlOrName.value
    ? userUrlOrName.value.trim()
    : undefined,
);
const orderSelect = signal<{
  orderBy: "date" | "ranking";
  orderDirection: "asc" | "desc";
}>({ orderBy: "date", orderDirection: "desc" });
const autocompleteItems = signal<string[]>([]);
const isLoading = signal(false);
const hasMore = signal(true);
const rankRecords = signal<GetOnArticleRankRecordItem[] | undefined>(undefined);
const rankSummary = signal<GetOnArticleRankSummaryResponse | undefined>(
  undefined,
);
const historyNamesOnRankSummary = signal<
  GetHistoryNamesOnArticleRankSummaryResponse | undefined
>(undefined);
const showHistoryNamesOnRankRecordFoundNotice = signal(false);

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

  sendRequest<GetNameAutocompleteRequest, GetNameAutocompleteResponse>({
    method: "GET",
    endpoint: "/v1/users/name-autocomplete",
    queryArgs: {
      name_part: value.trim(),
    },
    onSuccess: ({ data }) => (autocompleteItems.value = data.names),
  });
}

function handleQuery() {
  if (!userUrlOrName.value) {
    toastWarning({ message: "请输入有效的昵称或用户个人主页链接" });
    return;
  }

  hasMore.value = true;

  const endpointForRankRecords = userSlug.value
    ? `/v1/users/${userSlug.value}/on-article-rank-records`
    : `/v1/users/name/${userName.value}/on-article-rank-records`;
  sendRequest<GetOnArticleRankRecordsRequest, GetOnArticleRankRecordsResponse>({
    method: "GET",
    endpoint: endpointForRankRecords,
    queryArgs: {
      order_by: orderSelect.value.orderBy,
      order_direction: orderSelect.value.orderDirection,
    },
    onSuccess: ({ data }) =>
      batch(() => {
        rankRecords.value = data.records;
        if (data.records.length === 0) {
          hasMore.value = false;
        }
      }),
    isLoading,
  });

  const endpointForRankSummary = userSlug.value
    ? `/v1/users/${userSlug.value}/on-article-rank-summary`
    : `/v1/users/name/${userName.value}/on-article-rank-summary`;
  sendRequest<Record<string, never>, GetOnArticleRankSummaryResponse>({
    method: "GET",
    endpoint: endpointForRankSummary,
    onSuccess: ({ data }) => (rankSummary.value = data),
  });

  if (userName.value) {
    sendRequest<
      Record<string, never>,
      GetHistoryNamesOnArticleRankSummaryResponse
    >({
      method: "GET",
      endpoint: `/v1/users/name/${userName.value}/history-names-on-article-rank-summary`,
      onSuccess: ({ data }) =>
        batch(() => {
          historyNamesOnRankSummary.value = data;
          if (Object.keys(data.historyNamesOnrankSummary).length !== 0) {
            showHistoryNamesOnRankRecordFoundNotice.value = true;
          }
        }),
    });
  }
}

function handleLoadMore() {
  const endpoint = userSlug.value
    ? `/v1/users/${userSlug.value}/on-article-rank-records`
    : `/v1/users/name/${userName.value}/on-article-rank-records`;
  sendRequest<GetOnArticleRankRecordsRequest, GetOnArticleRankRecordsResponse>({
    method: "GET",
    endpoint,
    queryArgs: {
      order_by: orderSelect.value.orderBy,
      order_direction: orderSelect.value.orderDirection,
      offset: rankRecords.value!.length,
    },
    onSuccess: ({ data }) =>
      batch(() => {
        if (data.records.length === 0) {
          hasMore.value = false;
          return;
        }

        rankRecords.value = rankRecords.value!.concat(data.records);
      }),
    isLoading,
  });
}

function HistoryNamesOnRankRecordFoundNotice() {
  return (
    <Notice className="flex flex-col" colorScheme="info" title="昵称更改">
      <Text>找到您曾用昵称的上榜记录：</Text>
      <Column gap="gap-2">
        {Object.entries(
          historyNamesOnRankSummary.value!.historyNamesOnrankSummary,
        ).map(([name, dataCount]) => (
          <Text>
            {name}：{dataCount} 条
          </Text>
        ))}
      </Column>

      <SolidButton
        onClick={() => {
          batch(() => {
            // 替换当前输入的昵称为个人主页链接，同时隐藏该组件
            userUrlOrName.value = historyNamesOnRankSummary.value!.userUrl;
            showHistoryNamesOnRankRecordFoundNotice.value = false;
          });
          // 触发检索
          handleQuery();
        }}
      >
        查看完整数据
      </SolidButton>
    </Notice>
  );
}

function ResultTable() {
  return (
    <LazyLoadTable
      data={rankRecords.value!.map((item) => ({
        日期: (
          <Text className="text-center">{getDate(parseTime(item.date))}</Text>
        ),
        排名: <Text className="text-center">{item.ranking}</Text>,
        文章: (
          <ExternalLink
            className="block max-w-[60vw] overflow-hidden text-ellipsis whitespace-nowrap"
            href={item.articleUrl}
          >
            {item.articleTitle}
          </ExternalLink>
        ),
        获钻量: <Text className="text-center">{item.FPReward}</Text>,
      }))}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
    />
  );
}

export default function OnRankArticleViewer() {
  useSignalEffect(() => handleCompleteItemUpdate(userUrlOrName.value));

  return (
    <Column>
      <AutoCompleteInput
        id="user-name-or-url"
        label="用户昵称 / 个人主页链接"
        value={userUrlOrName}
        onEnter={handleQuery}
        options={autocompleteItems.value}
        fullWidth
      />
      <Select
        id="order-by"
        label="排序依据"
        value={orderSelect}
        options={[
          {
            label: "上榜日期（倒序）",
            value: { orderBy: "date", orderDirection: "desc" },
          },
          {
            label: "上榜日期（正序）",
            value: { orderBy: "date", orderDirection: "asc" },
          },
          {
            label: "排名（倒序）",
            value: { orderBy: "ranking", orderDirection: "asc" },
          },
          {
            label: "排名（正序）",
            value: { orderBy: "ranking", orderDirection: "asc" },
          },
        ]}
      />
      <SolidButton onClick={handleQuery} loading={isLoading.value} fullWidth>
        查询
      </SolidButton>

      {historyNamesOnRankSummary.value !== undefined &&
        showHistoryNamesOnRankRecordFoundNotice.value && (
          <HistoryNamesOnRankRecordFoundNotice />
        )}

      {rankSummary.value !== undefined && rankSummary.value.total !== 0 && (
        <Grid className="place-items-center" cols="grid-cols-2" gap="gap-6">
          <LargeText bold>
            前 10 名次数
            {rankSummary.value.top10}
          </LargeText>
          <LargeText bold>
            前 30 名次数
            {rankSummary.value.top30}
          </LargeText>
          <LargeText bold>
            前 50 名次数
            {rankSummary.value.top50}
          </LargeText>
          <LargeText bold>
            总上榜次数
            {rankSummary.value.total}
          </LargeText>
        </Grid>
      )}

      {rankRecords.value !== undefined &&
        (rankRecords.value.length !== 0 ? (
          <ResultTable />
        ) : (
          <LargeText>没有上榜记录</LargeText>
        ))}
    </Column>
  );
}
