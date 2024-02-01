import { computed, signal, useSignal, useSignalEffect } from "@preact/signals";
import {
  AutoCompleteInput,
  Column,
  ExternalLink,
  InfiniteScrollTable,
  LargeText,
  Notice,
  Row,
  Select,
  SolidButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  toastWarning,
} from "@sscreator/ui";
import { useEffect } from "preact/hooks";
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

const userUrlOrName = signal("");
const userSlug = computed(() => userUrlToSlug(userUrlOrName.value));
const userName = computed(() =>
  !userSlug.value && userUrlOrName.value ? userUrlOrName.value.trim() : null,
);
const orderBy = signal<{
  orderBy: "date" | "ranking";
  orderDirection: "asc" | "desc";
}>({ orderBy: "date", orderDirection: "desc" });

const isLoading = signal(false);
const showResult = signal(false);

function handleQuery() {
  if (!userUrlOrName.value) {
    toastWarning({ message: "请输入有效的昵称或用户个人主页链接" });
    return;
  }

  showResult.value = true;
}

function AutoCompleteUserNameOrUrl() {
  const autocompleteOptions = useSignal<string[]>([]);

  useSignalEffect(() => {
    if (!userUrlOrName.value.length) {
      return;
    }
    if (userUrlOrName.value.startsWith("https://")) {
      return;
    }

    sendRequest<GetNameAutocompleteRequest, GetNameAutocompleteResponse>({
      method: "GET",
      endpoint: "/v1/users/name-autocomplete",
      queryArgs: {
        name_part: userUrlOrName.value.trim(),
      },
      onSuccess: ({ data }) => (autocompleteOptions.value = data.names),
    });
  });

  useEffect(() => {
    showResult.value = false;
  }, [userUrlOrName.value]);

  return (
    <AutoCompleteInput
      id="user-name-or-url"
      label="用户昵称 / 个人主页链接"
      value={userUrlOrName}
      onEnter={handleQuery}
      options={autocompleteOptions.value}
      fullWidth
    />
  );
}

function OrderBy() {
  const timeRangeOptions = [
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
  ];

  useEffect(() => {
    showResult.value = false;
  }, [orderBy.value]);

  return (
    <Select
      id="order-by"
      label="排序依据"
      value={orderBy}
      options={timeRangeOptions}
      fullWidth
    />
  );
}

function HistoryNamesFoundNotice() {
  const historyNamesData =
    useSignal<GetHistoryNamesOnArticleRankSummaryResponse | null>(null);

  useEffect(() => {
    if (!showResult.value) {
      return;
    }
    if (!userName.value) {
      return;
    }

    historyNamesData.value = null;
    sendRequest<
      Record<string, never>,
      GetHistoryNamesOnArticleRankSummaryResponse
    >({
      method: "GET",
      endpoint: `/v1/users/name/${userName.value}/history-names-on-article-rank-summary`,
      onSuccess: ({ data }) => (historyNamesData.value = data),
    });
  }, [showResult.value]);

  if (!showResult.value || !historyNamesData.value) {
    return null;
  }

  // 无曾用昵称
  if (!Object.keys(historyNamesData.value.historyNamesOnrankSummary).length) {
    return null;
  }

  return (
    <Notice className="flex flex-col" colorScheme="info" title="曾用昵称">
      <Text>找到您曾用昵称的上榜记录：</Text>
      <Column gap="gap-2">
        {Object.entries(historyNamesData.value.historyNamesOnrankSummary).map(
          ([name, dataCount]) => (
            <Text>
              {name}：{dataCount} 条
            </Text>
          ),
        )}
      </Column>

      <SolidButton
        onClick={() => {
          // 替换当前输入的昵称为个人主页链接，同时隐藏该组件
          userUrlOrName.value = historyNamesData.value!.userUrl;
          historyNamesData.value = null;
          // 触发检索
          handleQuery();
        }}
      >
        查看完整数据
      </SolidButton>
    </Notice>
  );
}

function OnRankSummary() {
  const rankSummary = useSignal<GetOnArticleRankSummaryResponse | null>(null);

  useEffect(() => {
    if (!showResult.value) {
      return;
    }

    rankSummary.value = null;
    const endpoint = userSlug.value
      ? `/v1/users/${userSlug.value}/on-article-rank-summary`
      : `/v1/users/name/${userName.value}/on-article-rank-summary`;
    sendRequest<Record<string, never>, GetOnArticleRankSummaryResponse>({
      method: "GET",
      endpoint,
      onSuccess: ({ data }) => (rankSummary.value = data),
    });
  }, [showResult.value]);

  if (!showResult.value || !rankSummary.value) {
    return null;
  }

  // 用户无上榜文章
  if (!rankSummary.value.total) {
    return null;
  }

  return (
    <Row className="flex-wrap justify-around">
      <Column gap="gap-1">
        <Text>总共上榜</Text>
        <LargeText bold>{rankSummary.value.total} 次</LargeText>
      </Column>
      <Column gap="gap-1">
        <Text>前 10 名</Text>
        <LargeText bold>{rankSummary.value.top10} 次</LargeText>
      </Column>
      <Column gap="gap-1">
        <Text>前 30 名</Text>
        <LargeText bold>{rankSummary.value.top30} 次</LargeText>
      </Column>
      <Column gap="gap-1">
        <Text>前 50 名</Text>
        <LargeText bold>{rankSummary.value.top50} 次</LargeText>
      </Column>
    </Row>
  );
}

function OnRankRecordsTable() {
  const endpoint = userSlug.value
    ? `/v1/users/${userSlug.value}/on-article-rank-records`
    : `/v1/users/name/${userName.value}/on-article-rank-records`;

  const onRankRecords = useSignal<GetOnArticleRankRecordItem[] | null>(null);
  const hasMore = useSignal(true);

  const onLoadMore = () => {
    sendRequest<
      GetOnArticleRankRecordsRequest,
      GetOnArticleRankRecordsResponse
    >({
      method: "GET",
      endpoint,
      queryArgs: {
        order_by: orderBy.value.orderBy,
        order_direction: orderBy.value.orderDirection,
        offset: onRankRecords.value!.length,
      },
      onSuccess: ({ data }) => {
        if (!data.records) {
          hasMore.value = false;
          return;
        }

        onRankRecords.value = onRankRecords.value!.concat(data.records);
      },
      isLoading,
    });
  };

  useEffect(() => {
    if (!showResult.value) {
      return;
    }

    onRankRecords.value = null;
    sendRequest<
      GetOnArticleRankRecordsRequest,
      GetOnArticleRankRecordsResponse
    >({
      method: "GET",
      endpoint,
      queryArgs: {
        order_by: orderBy.value.orderBy,
        order_direction: orderBy.value.orderDirection,
      },
      onSuccess: ({ data }) => {
        if (!data.records) {
          hasMore.value = false;
        }

        onRankRecords.value = data.records;
      },
      isLoading,
    });
  }, [showResult.value]);

  if (!showResult.value || !onRankRecords.value) {
    return null;
  }

  // 无上榜记录
  if (!onRankRecords.value.length) {
    return <LargeText className="text-center">无上榜记录</LargeText>;
  }

  return (
    <InfiniteScrollTable
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
    >
      <Table className="w-full whitespace-nowrap text-center">
        <TableHeader>
          <TableHead>日期</TableHead>
          <TableHead>排名</TableHead>
          <TableHead>文章</TableHead>
          <TableHead>获钻量</TableHead>
        </TableHeader>
        <TableBody>
          {onRankRecords.value!.map((item) => (
            <TableRow key={`${item.date}-${item.articleUrl}`}>
              <TableCell>{getDate(parseTime(item.date))}</TableCell>
              <TableCell>{item.ranking}</TableCell>
              <TableCell className="text-left">
                <ExternalLink
                  className="block max-w-[60vw] overflow-hidden text-ellipsis"
                  href={item.articleUrl}
                >
                  {item.articleTitle}
                </ExternalLink>
              </TableCell>
              <TableCell>{item.FPReward}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </InfiniteScrollTable>
  );
}

export default function OnRankArticleViewer() {
  return (
    <Column>
      <AutoCompleteUserNameOrUrl />
      <OrderBy />
      <SolidButton onClick={handleQuery} loading={isLoading.value} fullWidth>
        查询
      </SolidButton>

      <HistoryNamesFoundNotice />
      <OnRankSummary />
      <OnRankRecordsTable />
    </Column>
  );
}
