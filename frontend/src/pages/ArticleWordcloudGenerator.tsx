import { computed, signal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  SolidButton,
  Text,
  TextInput,
  toastWarning,
} from "@sscreator/ui";
import { useEffect } from "preact/hooks";
import WordCloud from "../components/charts/Wordcloud";
import { useDataTrigger } from "../hooks/useData";
import type { GetWordFreqResponse } from "../models/articles";
import { articleUrlToSlug } from "../utils/jianshuHelper";

const articleUrl = signal("");
const articleSlug = computed(() => articleUrlToSlug(articleUrl.value));

function handleGenerate(trigger: () => void) {
  if (!articleSlug.value) {
    toastWarning({ message: "请输入有效的文章链接" });
    return;
  }

  trigger();
}

function ArticleWordCloud({ wordFreq }: { wordFreq?: GetWordFreqResponse }) {
  if (!wordFreq) return null;

  return (
    <>
      <Text>
        文章标题：
        <ExternalLink href={articleUrl.value}>{wordFreq.title}</ExternalLink>
      </Text>
      <WordCloud
        className="aspect-video max-w-2xl"
        options={{
          series: [
            {
              type: "wordCloud",
              data: Object.entries(wordFreq.wordFreq).map(([word, freq]) => ({
                name: word,
                value: freq,
              })),
              textStyle: {
                color: "#EA6F5A",
              },
              width: "100%",
              height: "100%",
            },
          ],
        }}
      />
    </>
  );
}

export default function ArticleWordcloudGenerator() {
  const {
    data: wordFreq,
    isLoading,
    trigger,
    reset,
  } = useDataTrigger<Record<string, never>, GetWordFreqResponse>({
    method: "GET",
    endpoint: `/v1/articles/${articleSlug.value}/word-freq`,
  });

  useEffect(() => {
    reset();
  }, [articleUrl.value]);

  return (
    <Column>
      <TextInput
        id="article-url"
        label="文章链接"
        value={articleUrl}
        onEnter={() => handleGenerate(trigger)}
        errorMessage={
          articleUrl.value && !articleSlug.value ? "链接无效" : undefined
        }
      />
      <SolidButton
        onClick={() => handleGenerate(trigger)}
        loading={isLoading}
        fullWidth
      >
        生成
      </SolidButton>

      <ArticleWordCloud wordFreq={wordFreq} />
    </Column>
  );
}
