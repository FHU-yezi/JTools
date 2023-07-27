import { batch, signal } from "@preact/signals";
import toast from "react-hot-toast";
import SSButton from "../components/SSButton";
import SSLink from "../components/SSLink";
import SSText from "../components/SSText";
import SSTextInput from "../components/SSTextInput";
import SSWordcloud from "../components/charts/SSWordcloud";
import {
  WordFreqDataItem,
  WordFreqDataRequest,
  WordFreqDataResponse,
} from "../models/ArticleWordcloudGenerator/WordFreqData";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";

const articleURL = signal("");
const isLoading = signal(false);
const articleTitle = signal<string | undefined>(undefined);
const wordFreqData = signal<WordFreqDataItem | undefined>(undefined);

function handleGenerate() {
  if (articleURL.value.length === 0) {
    toast("请输入文章链接", {
      icon: " ⚠️",
    });
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
    isLoading
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
    <div className="flex flex-col gap-4">
      <SSTextInput
        label="文章链接"
        value={articleURL}
        onEnter={handleGenerate}
      />
      <SSButton onClick={handleGenerate} loading={isLoading.value}>
        查询
      </SSButton>

      {articleTitle.value !== undefined && articleURL.value !== undefined && (
        <SSText center>
          文章：
          <SSLink
            url={articleURL.value}
            label={
              articleTitle.value.length <= 17
                ? articleTitle.value
                : `${articleTitle.value.substring(0, 17)}...`
            }
            isExternal
          />
        </SSText>
      )}

      {wordFreqData.value !== undefined && <Wordcloud />}
    </div>
  );
}
