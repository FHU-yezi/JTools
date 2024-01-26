import { computed, signal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  SolidButton,
  Text,
  TextInput,
} from "@sscreator/ui";
import SSWordcloud from "../components/charts/SSWordcloud";
import type { GetWordFreqResponse } from "../models/articles";
import { articleUrlToSlug } from "../utils/jianshuHelper";
import { sendRequest } from "../utils/sendRequest";
import { toastWarning } from "../utils/toastHelper";

const articleUrl = signal("");
const articleSlug = computed(() => articleUrlToSlug(articleUrl.value));
const isLoading = signal(false);
const result = signal<GetWordFreqResponse | undefined>(undefined);

function handleGenerate() {
  if (!articleSlug.value) {
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
      <TextInput
        id="article-url"
        label="文章链接"
        value={articleUrl}
        onEnter={handleGenerate}
        errorMessage={
          articleUrl.value && !articleSlug.value ? "链接无效" : undefined
        }
      />
      <SolidButton onClick={handleGenerate} loading={isLoading.value} fullWidth>
        生成
      </SolidButton>

      {result.value !== undefined && (
        <>
          <Text>
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
