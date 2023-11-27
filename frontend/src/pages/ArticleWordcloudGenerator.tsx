import { computed, signal } from "@preact/signals";
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
const result = signal<GetWordFreqResponse | undefined>(undefined);

function handleGenerate() {
  if (articleSlug.value === undefined) {
    toastWarning({ message: "请输入有效的文章链接" });
    return;
  }

  sendRequest<Record<string, never>, GetWordFreqResponse>({
    method: "GET",
    endpoint: `/v1/articles/${articleSlug.value}/word-freq`,
    onSuccess: ({ data }) => (result.value = data),
    isLoading,
  });
}

function Wordcloud() {
  return (
    <SSWordcloud
      data={Object.entries(result.value!.wordFreq).map(([text, value]) => ({
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

      {result.value !== undefined && (
        <>
          <Text truncate>
            文章标题：
            <ExternalLink href={articleUrl.value}>
              {result.value.title}
            </ExternalLink>
          </Text>
          <Wordcloud />
        </>
      )}
    </Column>
  );
}
