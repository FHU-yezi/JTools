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
  GetHistoryNamesOnArticleRankSummaryResponse,
  GetNameAutocompleteRequest,
  GetNameAutocompleteResponse,
  GetOnArticleRankRecordItem,
  GetOnArticleRankRecordsRequest,
  GetOnArticleRankRecordsResponse,
  GetOnArticleRankSummaryResponse,
} from "../models/users";
import { sendRequest } from "../utils/sendRequest";
import { getDate, parseTime } from "../utils/timeHelper";
import { toastWarning } from "../utils/toastHelper";

const userUrlOrName = signal("");
const userSlug = computed(() => {
  const matchResult = userUrlOrName.value.match(
    "https://www.jianshu.com/u/(\\w{6,12})",
  );
  if (matchResult !== null && matchResult[1] !== undefined) {
    return matchResult[1];
  }
  return undefined;
});
const userName = computed(() =>
  userSlug.value === undefined &&
    userUrlOrName.value.length !== 0
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
  if (
    userUrlOrName.value.length === 0 ||
    (userSlug.value === undefined && userName.value === undefined)
  ) {
    toastWarning({ message: "请输入有效的昵称或用户个人主页链接" });
    return;
  }

  hasMore.value = true;

  const endpointForRankRecords =
    userSlug.value !== undefined
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

  const endpointForRankSummary =
    userSlug.value !== undefined
      ? `/v1/users/${userSlug.value}/on-article-rank-summary`
      : `/v1/users/name/${userName.value}/on-article-rank-summary`;
  sendRequest<Record<string, never>, GetOnArticleRankSummaryResponse>({
    method: "GET",
    endpoint: endpointForRankSummary,
    onSuccess: ({ data }) => (rankSummary.value = data),
  });

  if (userName.value !== undefined) {
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
  const endpoint =
    userSlug.value !== undefined
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
    <InfoAlert>
      <Column>
        <Text large bold>
          数据不完整
        </Text>
        <Text>您可能更改过简书昵称，我们找到了其它与您有关的上榜记录：</Text>
        <Column gap="gap-2">
          {Object.entries(historyNamesOnRankSummary.value!).map(
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
            // 替换当前输入的昵称为个人主页链接，同时隐藏该组件
            userUrlOrName.value = historyNamesOnRankSummary.value!.userUrl;
            showHistoryNamesOnRankRecordFoundNotice.value = false;
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
      data={rankRecords.value!.map((item) => ({
        日期: <Text center>{getDate(parseTime(item.date))}</Text>,
        排名: <Text center>{item.ranking}</Text>,
        文章: (
          <ExternalLink
            className="block max-w-[60vw] overflow-hidden text-ellipsis whitespace-nowrap"
            href={item.articleUrl}
            hideIcon
          >
            {item.articleTitle}
          </ExternalLink>
        ),
        获钻量: <Text center>{item.FPReward}</Text>,
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
        value={userUrlOrName}
        onEnter={handleQuery}
        onValueChange={handleCompleteItemUpdate}
        completeItems={autocompleteItems}
      />
      <Switch
        label="排序依据"
        value={orderSelect}
        data={[
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
      <PrimaryButton onClick={handleQuery} loading={isLoading.value} fullWidth>
        查询
      </PrimaryButton>

      {historyNamesOnRankSummary.value !== undefined &&
        showHistoryNamesOnRankRecordFoundNotice.value && (
          <HistoryNamesOnRankRecordFoundNotice />
        )}

      {rankSummary.value !== undefined && rankSummary.value.total !== 0 && (
        <Grid className="place-items-center" cols="grid-cols-2" gap="gap-6">
          <FieldBlock fieldName="前 10 名次数">
            <Text large bold>
              {rankSummary.value.top10}
            </Text>
          </FieldBlock>
          <FieldBlock fieldName="前 30 名次数">
            <Text large bold>
              {rankSummary.value.top30}
            </Text>
          </FieldBlock>
          <FieldBlock fieldName="前 50 名次数">
            <Text large bold>
              {rankSummary.value.top50}
            </Text>
          </FieldBlock>
          <FieldBlock fieldName="总上榜次数">
            <Text large bold>
              {rankSummary.value.total}
            </Text>
          </FieldBlock>
        </Grid>
      )}

      {rankRecords.value !== undefined &&
        (rankRecords.value.length !== 0 ? (
          <ResultTable />
        ) : (
          <NoResultNotice message="没有上榜记录" />
        ))}
    </Column>
  );
}
