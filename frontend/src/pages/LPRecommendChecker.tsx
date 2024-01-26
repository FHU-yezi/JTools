import { computed, signal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  LargeText,
  SmallText,
  SolidButton,
  Text,
  TextInput,
} from "@sscreator/ui";
import dayjs from "dayjs";
import type { GetLPRecommendCheckResponse } from "../models/articles";
import { articleUrlToSlug } from "../utils/jianshuHelper";
import { sendRequest } from "../utils/sendRequest";
import { getDate, parseTime } from "../utils/timeHelper";
import { toastWarning } from "../utils/toastHelper";

const articleUrl = signal("");
const articleSlug = computed(() => articleUrlToSlug(articleUrl.value));

const isLoading = signal(false);
const result = signal<GetLPRecommendCheckResponse | null>(null);

function handleCheck() {
  if (!articleSlug.value) {
    toastWarning({ message: "请输入有效的文章链接" });
    return;
  }

  sendRequest<Record<string, never>, GetLPRecommendCheckResponse>({
    method: "GET",
    endpoint: `/v1/articles/${articleSlug.value}/lp-recommend-check`,
    onSuccess: ({ data }) => (result.value = data),
    isLoading,
  });
}

function Result() {
  if (!result.value) {
    return null;
  }

  const shouldFPRewardHighlight = result.value.FPReward >= 35;
  const shouldnextCanRecommendDateHighlight = result.value.nextCanRecommendDate
    ? parseTime(result.value!.nextCanRecommendDate) >= dayjs()
    : false;

  return (
    <>
      <LargeText
        colorScheme={result.value.canRecommendNow ? "success" : "danger"}
        bold
      >
        {result.value.canRecommendNow ? "可推荐" : "不可推荐"}
      </LargeText>
      <Column gap="gap-1">
        <Text colorScheme="gray">文章</Text>
        <ExternalLink className="text-lg" href={articleUrl.value}>
          {result.value.articleTitle}
        </ExternalLink>
      </Column>
      <Column gap="gap-1">
        <Text colorScheme={shouldFPRewardHighlight ? "danger" : "gray"}>
          获钻量
        </Text>
        <LargeText colorScheme={shouldFPRewardHighlight ? "danger" : undefined}>
          {result.value.FPReward}
        </LargeText>
      </Column>
      <Column gap="gap-1">
        <Text
          colorScheme={shouldnextCanRecommendDateHighlight ? "danger" : "gray"}
        >
          作者下次可推时间
        </Text>
        <LargeText
          colorScheme={
            shouldnextCanRecommendDateHighlight ? "danger" : undefined
          }
        >
          {result.value.nextCanRecommendDate
            ? getDate(parseTime(result.value.nextCanRecommendDate))
            : "作者未上过榜"}
        </LargeText>
      </Column>
    </>
  );
}

export default function LPRecommendChecker() {
  return (
    <Column>
      <SmallText colorScheme="gray">
        本工具仅依据 LP 理事会公开推文规则进行检测，具体事宜请以实际为准。
      </SmallText>
      <TextInput
        id="article-url"
        label="文章链接"
        value={articleUrl}
        onEnter={handleCheck}
        errorMessage={
          articleUrl.value && !articleSlug.value ? "链接无效" : undefined
        }
        selectAllOnFocus
      />
      <SolidButton onClick={handleCheck} loading={isLoading.value} fullWidth>
        检测
      </SolidButton>

      {result.value && <Result />}
    </Column>
  );
}
