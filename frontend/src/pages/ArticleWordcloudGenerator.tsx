import { batch, signal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  PrimaryButton,
  Text,
  TextInput,
} from "@sscreator/ui";
import SSWordcloud from "../components/charts/SSWordcloud";
import type {
  WordFreqDataItem,
  WordFreqDataRequest,
  WordFreqDataResponse,
} from "../models/ArticleWordcloudGenerator/WordFreqData";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { toastWarning } from "../utils/toastHelper";

const articleURL = signal("");
const isLoading = signal(false);
const articleTitle = signal<string | undefined>(undefined);
const wordFreqData = signal<WordFreqDataItem | undefined>(undefined);

function handleGenerate() {
  if (articleURL.value.length === 0) {
    toastWarning("请输入文章链接");
    return;
  }

  fetchData<WordFreqDataRequest, WordFreqDataResponse>(
    "POST",
    "/tools/article_wordcloud_generator/word_freq_data",
    {
      article_url: articleURL.value,
    },
    (data) =>
      batch(() => {
        articleTitle.value = data.title;
        wordFreqData.value = data.word_freq;
      }),
    commonAPIErrorHandler,
    isLoading,
  );
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
      <TextInput label="文章链接" value={articleURL} onEnter={handleGenerate} />
      <PrimaryButton
        onClick={handleGenerate}
        loading={isLoading.value}
        fullWidth
      >
        查询
      </PrimaryButton>

      {articleTitle.value !== undefined && articleURL.value !== undefined && (
        <Text center>
          文章：
          <ExternalLink href={articleURL.value}>
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
