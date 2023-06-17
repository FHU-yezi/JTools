import {
  Badge, Button, Card, Stack, Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { batch, signal } from "@preact/signals";
import SSLink from "../components/SSLink";
import SSTextInput from "../components/SSTextInput";
import {
  ArticleDataRequest,
  ArticleDataRqsponse,
} from "../models/ArticlePublishTimeViewer/ArticleData";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { getDatetime, parseTime } from "../utils/timeHelper";

const articleURL = signal("");
const hasResult = signal(false);
const isLoading = signal(false);
const articleTitle = signal("");
const isUpdated = signal<boolean | undefined>(undefined);
const publishTime = signal<Date | undefined>(undefined);
const publishTimeToNowHumanReadable = signal("");
const updateTime = signal<Date | undefined>(undefined);
const updateTimeToNowHumanReadable = signal("");

function handleQuery() {
  if (articleURL.value.length === 0) {
    notifications.show({
      message: "请输入文章链接",
      color: "blue",
    });
    return;
  }

  try {
    fetchData<ArticleDataRequest, ArticleDataRqsponse>(
      "GET",
      "/tools/article_publish_time_viewer/article_data",
      {
        article_url: articleURL.value,
      },
      (data) => {
        batch(() => {
          articleTitle.value = data.title;
          isUpdated.value = data.is_updated;
          publishTime.value = parseTime(data.publish_time);
          publishTimeToNowHumanReadable.value = data.publish_time_to_now_human_readable;
          updateTime.value = parseTime(data.update_time);
          updateTimeToNowHumanReadable.value = data.update_time_to_now_human_readable;
        });
      },
      commonAPIErrorHandler,
      hasResult,
      isLoading,
    );
  } catch {}
}

export default function ArticlePublishTimeViewer() {
  return (
    <Stack>
      <SSTextInput label="文章链接" value={articleURL} onEnter={handleQuery} />
      <Button onClick={handleQuery} loading={isLoading.value}>
        查询
      </Button>
      {hasResult.value && (
        <Card padding="lg" shadow="xs" radius="lg" withBorder>
          <Text>
            文章：
            <SSLink
              url={articleURL.value}
              label={articleTitle.value.length <= 17 ? articleTitle.value : `${articleTitle.value.substring(0, 17)}...`}
              isExternal
            />
          </Text>
          <Text>
            更新过：
            <Badge size="lg" color={isUpdated.value ? "orange" : "green"}>
              {isUpdated.value ? "是" : "否"}
            </Badge>
          </Text>
          <Text>
            发布时间：
            {getDatetime(publishTime.value!)}
            （
            {publishTimeToNowHumanReadable.value}
            ）
          </Text>
          <Text>
            更新时间：
            {getDatetime(updateTime.value!)}
            （
            {updateTimeToNowHumanReadable.value}
            ）
          </Text>
        </Card>
      )}
    </Stack>
  );
}
