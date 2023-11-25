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

const userURLOrUserName = signal("");
const userSlug = computed(() => {
  const matchResult = userURLOrUserName.value.match(
    "https://www.jianshu.com/u/(\\w{6,12})",
  );
  if (matchResult !== null && matchResult[1] !== undefined) {
    return matchResult[1];
  }
  return undefined;
});
const userName = computed(() =>
  userSlug.value === undefined && userURLOrUserName.value.length !== 0
    ? userURLOrUserName.value.trim()
    : undefined,
);
const sortSelect = signal<
  "date desc" | "date asc" | "ranking desc" | "ranking asc"
>("date desc");
const sortBy = computed<"date" | "ranking">(
  () => sortSelect.value.split(" ")[0] as any,
);
const sortOrder = computed<"asc" | "desc">(
  () => sortSelect.value.split(" ")[1] as any,
);
const completeItems = signal<string[]>([]);
const isLoading = signal(false);
const hasMore = signal(true);
const result = signal<GetOnArticleRankRecordItem[] | undefined>(undefined);
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

  sendRequest<GetNameAutocompleteRequest, GetNameAutocompleteResponse>({
    method: "GET",
    endpoint: "/v1/users/name-autocomplete",
    queryArgs: {
      name_part: value.trim(),
    },
    onSuccess: ({ data }) => (completeItems.value = data.names),
  });
}

function handleQuery() {
  if (userURLOrUserName.value.length === 0) {
    toastWarning({ message: "请输入用户昵称或个人主页链接" });
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
      order_by: sortBy.value,
      order_direction: sortOrder.value,
    },
    onSuccess: ({ data }) =>
      batch(() => {
        result.value = data.records;
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
    onSuccess: ({ data }) =>
      batch(() => {
        top10Count.value = data.top10;
        top30Count.value = data.top30;
        top50Count.value = data.top50;
        totalCount.value = data.total;
      }),
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
          sameURLRecordsSummary.value = data.historyNamesOnrankSummary;
          sameURLUserURL.value = data.userUrl;
        }),
    });
  }
}

function handleLoadMore() {
  const endpoint =
    userSlug.value !== undefined
      ? `/v1/users/${userSlug.value}/on-article-rank-summary`
      : `/v1/users/name/${userName.value}/on-article-rank-summary`;
  sendRequest<GetOnArticleRankRecordsRequest, GetOnArticleRankRecordsResponse>({
    method: "GET",
    endpoint,
    queryArgs: {
      order_by: sortBy.value,
      order_direction: sortOrder.value,
    },
    onSuccess: ({ data }) =>
      batch(() => {
        result.value = data.records!.concat(data.records);
        if (data.records.length === 0) {
          hasMore.value = false;
        }
      }),
    isLoading,
  });
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
            value: "date desc",
          },
          {
            label: "上榜日期（正序）",
            value: "date asc",
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
