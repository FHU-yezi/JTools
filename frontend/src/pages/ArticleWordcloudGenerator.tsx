import { batch, computed, signal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  PrimaryButton,
  Text,
  TextInput,
} from "@sscreator/ui";
import SSWordcloud from "../components/charts/SSWordcloud";
import type { GetWordFreqResponse } from "../models/articles";
import { sendRequest } from "../utils/sendRequest";
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
const articleTitle = signal<string | undefined>(undefined);
const wordFreqData = signal<Record<string, number> | undefined>(undefined);

function handleGenerate() {
  if (articleUrl.value.length === 0) {
    toastWarning({ message: "请输入文章链接" });
    return;
  }

  sendRequest<Record<string, never>, GetWordFreqResponse>({
    method: "GET",
    endpoint: `/v1/articles/${articleSlug.value}/word-freq`,
    onSuccess: ({ data }) =>
      batch(() => {
        articleTitle.value = data.title;
        wordFreqData.value = data.wordFreq;
      }),
    isLoading,
  });
}

function Wordcloud() {
  return (
    <SSWordcloud
      data={Object.entries(wordFreqData.value!).map(([text, value]) => ({
        text,
        value,
      }))}
    />
  );
}

export default function ArticleWordcloudGenerator() {
  return (
    <Column>
      <TextInput label="文章链接" value={articleUrl} onEnter={handleGenerate} />
      <PrimaryButton
        onClick={handleGenerate}
        loading={isLoading.value}
        fullWidth
      >
        查询
      </PrimaryButton>

      {articleTitle.value !== undefined && articleUrl.value !== undefined && (
        <Text center>
          文章：
          <ExternalLink href={articleUrl.value}>
            {articleTitle.value.length <= 17
              ? articleTitle.value
              : `${articleTitle.value.substring(0, 17)}...`}
          </ExternalLink>
        </Text>
      )}

      {wordFreqData.value !== undefined && <Wordcloud />}
    </Column>
  );
}
