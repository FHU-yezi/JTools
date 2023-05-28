import { Button, Stack, Card, Text, Badge } from "@mantine/core";
import JMFTextInput from "../components/JMFTextInput";
import { signal, batch } from "@preact/signals";
import { notifications } from "@mantine/notifications";
import { fetchData, fetchStatus } from "../utils";
import {
  ArticleDataRequest,
  ArticleDataRqsponse,
} from "../models/ArticlePublishTimeViewer/ArticleData";

const articleURL = signal("");
const isLoading = signal(false);
const hasResult = signal(false);
const articleTitle = signal("");
const isUpdated = signal<boolean | undefined>(undefined);
const publishTime = signal<Date | undefined>(undefined);
const publishTimeToNowHumanReadable = signal("");
const updateTime = signal<Date | undefined>(undefined);
const updateTimeToNowHumanReadable = signal("");

function handleQuery() {
  if (isLoading.value) {
    return;
  }

  if (articleURL.value.length === 0) {
    notifications.show({
      message: "请输入文章链接",
      color: "blue",
    });
    return;
  }

  batch(() => {
    isLoading.value = true;
    hasResult.value = false;
  });

  fetchData<ArticleDataRequest, ArticleDataRqsponse>(
    "POST",
    "/tools/article_publish_time_viewer/article_data",
    {
      article_url: articleURL.value,
    },
  ).then(({ status, data }) => {
    if (status === fetchStatus.OK) {
      batch(() => {
        isLoading.value = false;
        hasResult.value = true;
        articleTitle.value = data!.title;
        isUpdated.value = data!.is_updated;
        publishTime.value = new Date(data!.publish_time * 1000);
        publishTimeToNowHumanReadable.value =
          data!.publish_time_to_now_human_readable;
        updateTime.value = new Date(data!.update_time * 1000);
        updateTimeToNowHumanReadable.value =
          data!.update_time_to_now_human_readable;
      });
    } else {
      isLoading.value = false;
    }
  });
}

export default function ArticlePublishTimeViewer() {
  return (
    <Stack>
      <JMFTextInput label="文章链接" value={articleURL} />
      {isLoading.value ? (
        <Button loading fullWidth>
          查询
        </Button>
      ) : (
        <Button onClick={handleQuery} fullWidth>
          查询
        </Button>
      )}
      {hasResult.value && (
        <Card padding="lg" shadow="xs" radius="lg" withBorder>
          <Text>标题：{articleTitle.value}</Text>
          <Text>
            更新过：
            <Badge size="lg" color={isUpdated.value ? "orange" : "green"}>
              {isUpdated.value ? "是" : "否"}
            </Badge>
          </Text>
          <Text>
            发布时间：{publishTime.value?.toLocaleDateString()}（
            {publishTimeToNowHumanReadable.value}）
          </Text>
          <Text>
            更新时间：{updateTime.value?.toLocaleDateString()}（
            {updateTimeToNowHumanReadable.value}）
          </Text>
        </Card>
      )}
    </Stack>
  );
}
