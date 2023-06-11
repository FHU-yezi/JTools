import {
  Button, Center, Stack, Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Signal, batch, signal } from "@preact/signals";
import { Chart as ChartInstance, Colors, LinearScale } from "chart.js";
import { WordCloudController, WordElement } from "chartjs-chart-wordcloud";
import { Chart } from "react-chartjs-2";
import ChartWrapper from "../components/ChartWrapper";
import JMFLink from "../components/JMFLink";
import JMFTextInput from "../components/JMFTextInput";
import { WordFreqDataItem, WordFreqDataRequest, WordFreqDataResponse } from "../models/ArticleWordcloudGenerator/WordFreqData";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";

ChartInstance.register(Colors, LinearScale, WordCloudController, WordElement);

const articleURL = signal("");
const hasResult = signal(false);
const isLoading = signal(false);
const articleTitle = signal("");
const wordFreqData = signal<WordFreqDataItem>({});

interface WordcloudProps {
    data: Signal<WordFreqDataItem>
}

function handleGenerate() {
  if (articleURL.value.length === 0) {
    notifications.show({
      message: "请输入文章链接",
      color: "blue",
    });
    return;
  }

  fetchData<WordFreqDataRequest, WordFreqDataResponse>(
    "GET",
    "/tools/article_wordcloud_generator/word_freq_data",
    {
      article_url: articleURL.value,
    },
    (data) => batch(() => {
      articleTitle.value = data.title;
      wordFreqData.value = data.word_freq;
    }),
    commonAPIErrorHandler,
    hasResult,
    isLoading,
  );
}

function Wordcloud({ data }: WordcloudProps) {
  return (
    <Chart
      type="wordCloud"
      data={{
        labels: Object.keys(data.value),
        datasets: [{
          // * 10 用来调整每个词的大小
          data: Object.values(data.value).map((item) => item * 10),
          color: "#EA6F5A",
        }],
      }}
      options={{
        events: [],
      }}
    />
  );
}

export default function ArticleWordcloudGenerator() {
  return (
    <Stack>
      <JMFTextInput label="文章链接" value={articleURL} onEnter={handleGenerate} />
      <Button onClick={handleGenerate} loading={isLoading.value}>查询</Button>
      {hasResult.value && (
      <>
        <Center>
          <Text>文章：</Text>
          <JMFLink
            url={articleURL.value}
            label={articleTitle.value.length <= 17 ? articleTitle.value : `${articleTitle.value.substring(0, 17)}...`}
            isExternal
          />
        </Center>
        <ChartWrapper chartType="radial" minWidth={800} height={500} allowOverflow>
          <Wordcloud data={wordFreqData} />
        </ChartWrapper>
      </>
      )}
    </Stack>
  );
}
