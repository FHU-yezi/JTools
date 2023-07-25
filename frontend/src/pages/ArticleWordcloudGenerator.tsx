import { batch, signal } from "@preact/signals";
import { Chart as ChartInstance, Colors, LinearScale } from "chart.js";
import { WordCloudController, WordElement } from "chartjs-chart-wordcloud";
import { Chart } from "react-chartjs-2";
import toast from "react-hot-toast";
import ChartWrapper from "../components/ChartWrapper";
import SSButton from "../components/SSButton";
import SSLink from "../components/SSLink";
import SSText from "../components/SSText";
import SSTextInput from "../components/SSTextInput";
import {
  WordFreqDataItem,
  WordFreqDataRequest,
  WordFreqDataResponse,
} from "../models/ArticleWordcloudGenerator/WordFreqData";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";

ChartInstance.register(Colors, LinearScale, WordCloudController, WordElement);

const articleURL = signal("");
const isLoading = signal(false);
const articleTitle = signal<string | undefined>(undefined);
const wordFreqData = signal<WordFreqDataItem | undefined>(undefined);

interface WordcloudProps {
  data: WordFreqDataItem;
}

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

function Wordcloud({ data }: WordcloudProps) {
  const scale = 120 / Math.max(...Object.values(data));
  return (
    <Chart
      type="wordCloud"
      data={{
        labels: Object.keys(data),
        datasets: [
          {
            // 使用最高频词的出现次数调整每个词的大小，使高频词不至于过大而溢出画面
            data: Object.values(data).map((item) => item * scale),
            color: "#EA6F5A",
          },
        ],
      }}
      options={{
        events: [],
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
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

      {typeof articleTitle.value !== "undefined" &&
        typeof articleURL.value !== "undefined" && (
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

      {typeof wordFreqData.value !== "undefined" && (
        <ChartWrapper
          chartType="radial"
          minWidth={800}
          height={500}
          allowOverflow
        >
          <Wordcloud data={wordFreqData.value} />
        </ChartWrapper>
      )}
    </div>
  );
}
