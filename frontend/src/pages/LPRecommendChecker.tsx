import { computed, signal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  PrimaryButton,
  Text,
  TextInput,
} from "@sscreator/ui";
import type { GetLPRecommendCheckResponse } from "../models/articles";
import { sendRequest } from "../utils/sendRequest";
import { getDatetime, parseTime } from "../utils/timeHelper";
import { toastWarning } from "../utils/toastHelper";

const articleUrl = signal("");
const articleSlug = computed(() => {
  const matchResult = articleUrl.value!.match(
    "https://www.jianshu.com/p/(\\w{12})",
  );
  if (matchResult !== null && matchResult[1] !== undefined) {
    return matchResult[1];
  }
  return undefined;
});
const isLoading = signal(false);
const result = signal<GetLPRecommendCheckResponse | undefined>(undefined);

function handleCheck() {
  if (articleSlug.value === undefined) {
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

export default function LPRecommendChecker() {
  return (
    <Column>
      <TextInput label="文章链接" value={articleUrl} onEnter={handleCheck} />
      <PrimaryButton onClick={handleCheck} loading={isLoading.value} fullWidth>
        检测
      </PrimaryButton>

      {result.value !== undefined && (
        <>
          <Text
            color={
              result.value.canRecommendNow ? "text-green-500" : "text-red-500"
            }
            large
            bold
          >
            {result.value.canRecommendNow ? "可推荐" : "不可推荐"}
          </Text>
          <Text truncate>
            文章：
            <ExternalLink href={articleUrl.value}>
              {result.value.articleTitle}
            </ExternalLink>
          </Text>
          <Text>
            获钻量：
            <Text
              color={result.value.FPReward >= 35 ? "text-red-500" : undefined}
              bold
              inline
            >
              {result.value.FPReward}
            </Text>
          </Text>
          <Text>
            作者下次可推时间：
            <Text bold inline>
              {result.value.nextCanRecommendDate
                ? getDatetime(parseTime(result.value.nextCanRecommendDate))
                : "作者未上过榜"}
            </Text>
          </Text>
        </>
      )}
    </Column>
  );
}
