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
const checkResult = signal<GetLPRecommendCheckResponse | undefined>(undefined);

function handleCheck() {
  if (articleUrl.value.length === 0) {
    toastWarning({ message: "请输入文章链接" });
    return;
  }

  sendRequest<Record<string, never>, GetLPRecommendCheckResponse>({
    method: "GET",
    endpoint: `/v1/articles/${articleSlug.value}/lp-recommend-check`,
    onSuccess: ({ data }) => (checkResult.value = data),
    isLoading,
  });
}

export default function LPRecommendChecker() {
  return (
    <Column>
      <TextInput label="文章链接" value={articleUrl} onEnter={handleCheck} />
      <PrimaryButton onClick={handleCheck} loading={isLoading.value} fullWidth>
        查询
      </PrimaryButton>

      {checkResult.value && (
        <>
          <Text>
            文章标题：
            <ExternalLink href={articleUrl.value}>
              {checkResult.value.articleTitle}
            </ExternalLink>
          </Text>
          <Text>获钻量：{checkResult.value.FPReward}</Text>
          <Text>
            下次可推时间：
            {checkResult.value.nextCanRecommendDate
              ? getDatetime(parseTime(checkResult.value.nextCanRecommendDate))
              : "---"}
          </Text>
        </>
      )}
    </Column>
  );
}
