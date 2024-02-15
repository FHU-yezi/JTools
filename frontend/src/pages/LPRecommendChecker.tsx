import { computed, signal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  LargeText,
  Row,
  SmallText,
  SolidButton,
  Text,
  TextInput,
  toastWarning,
} from "@sscreator/ui";
import dayjs from "dayjs";
import { useEffect } from "preact/hooks";
import { useDataTrigger } from "../hooks/useData";
import type { GetLPRecommendCheckResponse } from "../models/articles";
import { articleUrlToSlug } from "../utils/jianshuHelper";
import { getDate, parseTime } from "../utils/timeHelper";

const articleUrl = signal("");
const articleSlug = computed(() => articleUrlToSlug(articleUrl.value));

function handleCheck(trigger: () => void) {
  if (!articleSlug.value) {
    toastWarning("请输入有效的文章链接");
    return;
  }

  trigger();
}

function Result({
  checkResult,
}: {
  checkResult?: GetLPRecommendCheckResponse;
}) {
  if (!checkResult) return null;

  const shouldFPRewardHighlight = checkResult.FPReward >= 35;
  const shouldnextCanRecommendDateHighlight = checkResult.nextCanRecommendDate
    ? parseTime(checkResult.nextCanRecommendDate) >= dayjs()
    : false;

  return (
    <>
      <LargeText
        color={checkResult.canRecommendNow ? "success" : "danger"}
        bold
      >
        {checkResult.canRecommendNow ? "可推荐" : "不可推荐"}
      </LargeText>
      <Row className="flex-wrap justify-around">
        <Column gap="gap-1">
          <Text color="gray">文章</Text>
          <ExternalLink className="text-lg" href={articleUrl.value}>
            {checkResult.articleTitle}
          </ExternalLink>
        </Column>
        <Column gap="gap-1">
          <Text color={shouldFPRewardHighlight ? "danger" : "gray"}>
            获钻量
          </Text>
          <LargeText color={shouldFPRewardHighlight ? "danger" : undefined}>
            {checkResult.FPReward.toFixed(2)}
          </LargeText>
        </Column>
        <Column gap="gap-1">
          <Text color={shouldnextCanRecommendDateHighlight ? "danger" : "gray"}>
            作者下次可推时间
          </Text>
          <LargeText
            color={shouldnextCanRecommendDateHighlight ? "danger" : undefined}
          >
            {checkResult.nextCanRecommendDate
              ? getDate(parseTime(checkResult.nextCanRecommendDate))
              : "作者未上过榜"}
          </LargeText>
        </Column>
      </Row>
    </>
  );
}

export default function LPRecommendChecker() {
  const {
    data: checkResult,
    isLoading,
    trigger,
    reset,
  } = useDataTrigger<Record<string, never>, GetLPRecommendCheckResponse>({
    method: "GET",
    endpoint: `/v1/articles/${articleSlug.value}/lp-recommend-check`,
  });

  useEffect(() => {
    reset();
  }, [articleUrl.value]);

  return (
    <Column>
      <SmallText color="gray">
        本工具仅依据 LP 理事会公开推文规则进行检测，具体事宜请以实际为准。
      </SmallText>
      <TextInput
        id="article-url"
        label="文章链接"
        value={articleUrl}
        onEnter={() => handleCheck(trigger)}
        errorMessage={
          articleUrl.value && !articleSlug.value ? "链接无效" : undefined
        }
        selectAllOnFocus
      />
      <SolidButton
        onClick={() => handleCheck(trigger)}
        loading={isLoading}
        fullWidth
      >
        检测
      </SolidButton>

      <Result checkResult={checkResult} />
    </Column>
  );
}
