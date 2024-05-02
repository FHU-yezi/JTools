import { computed, signal } from "@preact/signals";
import {
  AutoCompleteInput,
  Column,
  ExternalLink,
  InfiniteScroll,
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
  useDebouncedSignal,
} from "@sscreator/ui";
import { useEffect } from "preact/hooks";
import { useDataTrigger, useDataTriggerInfinite } from "../hooks/useData";
import type {
  GetHistoryNamesOnArticleRankSummaryResponse,
  GetNameAutocompleteRequest,
  GetNameAutocompleteResponse,
  GetOnArticleRankRecordsRequest,
  GetOnArticleRankRecordsResponse,
  GetOnArticleRankSummaryResponse,
} from "../models/users";
import { userUrlToSlug } from "../utils/jianshuHelper";
import { replaceAll } from "../utils/textHelper";
import { getDate, parseTime } from "../utils/timeHelper";

const userUrlOrName = signal("");
const userSlug = computed(() => userUrlToSlug(userUrlOrName.value));
const userName = computed(() =>
  userUrlOrName.value && !userSlug.value
    ? // 名称中含有 / 会导致 404 报错
      replaceAll(userUrlOrName.value.trim(), "/", "")
    : undefined,
);
const orderBy = signal<{
  orderBy: "date" | "ranking";
  orderDirection: "asc" | "desc";
}>({ orderBy: "date", orderDirection: "desc" });

function handleQuery(triggers: Array<() => void>) {
  if (!userUrlOrName.value) {
    toastWarning("请输入有效的昵称或用户个人主页链接");
    return;
  }

  triggers.map((trigger) => trigger());
}

function AutoCompleteUserNameOrUrl({ onEnter }: { onEnter: () => void }) {
  const debouncedUserName = useDebouncedSignal(userUrlOrName, 100);
  const { data: autocompleteOptions, trigger } = useDataTrigger<
    GetNameAutocompleteRequest,
    GetNameAutocompleteResponse
  >({
    method: "GET",
    endpoint: "/v1/users/name-autocomplete",
    queryArgs: {
      name_part: debouncedUserName.value ?? "",
    },
  });

  useEffect(() => {
    if (!debouncedUserName.value) return;
    if (debouncedUserName.value.length >= 15) return;

    trigger();
  }, [debouncedUserName.value]);

  return (
    <AutoCompleteInput
      id="user-name-or-url"
      label="用户昵称 / 个人主页链接"
      value={userUrlOrName}
      onEnter={onEnter}
      options={autocompleteOptions?.names ?? []}
      fullWidth
      selectAllOnFocus
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
      value: { orderBy: "ranking", orderDirection: "desc" },
    },
    {
      label: "排名（正序）",
      value: { orderBy: "ranking", orderDirection: "asc" },
    },
  ];

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

function HistoryNamesFoundNotice({
  historyNames,
  onShowFullData,
}: {
  historyNames?: GetHistoryNamesOnArticleRankSummaryResponse;
  onShowFullData: () => void;
}) {
  if (!historyNames) return null;

  // 无曾用昵称
  if (!Object.keys(historyNames.historyNamesOnrankSummary).length) return null;

  return (
    <Notice className="flex flex-col gap-4" color="info" title="曾用昵称">
      <Text>找到您曾用昵称的上榜记录：</Text>
      <Column gap="gap-2">
        {Object.entries(historyNames.historyNamesOnrankSummary).map(
          ([name, dataCount]) => (
            <Text key={name}>
              {name}：{dataCount} 条
            </Text>
          ),
        )}
      </Column>

      <SolidButton onClick={onShowFullData}>查看完整数据</SolidButton>
    </Notice>
  );
}

function OnRankSummary({
  rankSummary,
}: {
  rankSummary?: GetOnArticleRankSummaryResponse;
}) {
  if (!rankSummary) return null;

  // 用户无上榜文章
  if (!rankSummary.total) return null;

  return (
    <Row className="flex-wrap justify-around">
      <Column gap="gap-1">
        <Text>总共上榜</Text>
        <LargeText bold>{rankSummary.total} 次</LargeText>
      </Column>
      <Column gap="gap-1">
        <Text>前 10 名</Text>
        <LargeText bold>{rankSummary.top10} 次</LargeText>
      </Column>
      <Column gap="gap-1">
        <Text>前 30 名</Text>
        <LargeText bold>{rankSummary.top30} 次</LargeText>
      </Column>
      <Column gap="gap-1">
        <Text>前 50 名</Text>
        <LargeText bold>{rankSummary.top50} 次</LargeText>
      </Column>
    </Row>
  );
}

function OnRankRecordsTable({
  onRankRecords,
  isLoading,
  onLoadMore,
}: {
  onRankRecords?: GetOnArticleRankRecordsResponse[];
  isLoading: boolean;
  onLoadMore: () => void;
}) {
  if (!onRankRecords || !onRankRecords.length) return null;

  // 无上榜记录
  if (!onRankRecords[0].records.length) {
    return <LargeText className="text-center">无上榜记录</LargeText>;
  }

  const flattedRecords = onRankRecords.flatMap((page) => page.records);

  return (
    <InfiniteScroll onLoadMore={onLoadMore} hasMore isLoading={isLoading}>
      <Table className="w-full whitespace-nowrap text-center">
        <TableHeader>
          <TableRow>
            <TableHead>日期</TableHead>
            <TableHead>排名</TableHead>
            <TableHead>文章</TableHead>
            <TableHead>获钻量</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flattedRecords.map((item) => (
            <TableRow key={`${item.date}-${item.articleUrl}`}>
              <TableCell>{getDate(parseTime(item.date))}</TableCell>
              <TableCell>{item.ranking}</TableCell>
              <TableCell className="text-left">
                <ExternalLink
                  className="block max-w-[50vw] overflow-hidden text-ellipsis"
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
    </InfiniteScroll>
  );
}

export default function OnRankArticleViewer() {
  const {
    data: historyNames,
    isLoading: isHistoryNamesLoading,
    trigger: triggerHistoryNames,
    reset: resetHistoryNames,
  } = useDataTrigger<
    Record<string, never>,
    GetHistoryNamesOnArticleRankSummaryResponse
  >({
    method: "GET",
    endpoint: `/v1/users/name/${userName.value}/history-names-on-article-rank-summary`,
  });
  const {
    data: rankSummary,
    isLoading: isRankSummaryLoading,
    trigger: triggerRankSummary,
    reset: resetRankSummary,
  } = useDataTrigger<Record<string, never>, GetOnArticleRankSummaryResponse>({
    method: "GET",
    endpoint: userSlug.value
      ? `/v1/users/${userSlug.value}/on-article-rank-summary`
      : `/v1/users/name/${userName.value}/on-article-rank-summary`,
  });
  const {
    data: onRankRecords,
    isLoading: isOnRankRecordsLoading,
    nextPage,
    trigger: triggerOnRankRecords,
    reset: resetOnRankRecords,
  } = useDataTriggerInfinite<
    GetOnArticleRankRecordsRequest,
    GetOnArticleRankRecordsResponse
  >(({ currentPage, previousPageData }) =>
    previousPageData && !previousPageData.records.length
      ? null
      : {
          method: "GET",
          endpoint: userSlug.value
            ? `/v1/users/${userSlug.value}/on-article-rank-records`
            : `/v1/users/name/${userName.value}/on-article-rank-records`,
          queryArgs: {
            order_by: orderBy.value.orderBy,
            order_direction: orderBy.value.orderDirection,
            offset: currentPage * 20,
          },
        },
  );

  useEffect(() => {
    resetHistoryNames();
    resetRankSummary();
    resetOnRankRecords();
  }, [userUrlOrName.value, orderBy.value]);

  const triggers = [
    triggerHistoryNames,
    triggerRankSummary,
    triggerOnRankRecords,
  ];

  return (
    <>
      <AutoCompleteUserNameOrUrl onEnter={() => handleQuery(triggers)} />
      <OrderBy />
      <SolidButton
        onClick={() => handleQuery(triggers)}
        loading={
          isHistoryNamesLoading || isRankSummaryLoading
          // TODO
          // isOnRankRecordsLoading
        }
        fullWidth
      >
        查询
      </SolidButton>

      <HistoryNamesFoundNotice
        historyNames={historyNames}
        onShowFullData={() => {
          // 替换当前输入的昵称为个人主页链接，同时隐藏该组件
          userUrlOrName.value = historyNames!.userUrl;
          resetHistoryNames();
          // 触发检索
          handleQuery(triggers);
        }}
      />
      <OnRankSummary rankSummary={rankSummary} />
      <OnRankRecordsTable
        onRankRecords={onRankRecords}
        isLoading={isOnRankRecordsLoading}
        onLoadMore={nextPage}
      />
    </>
  );
}
