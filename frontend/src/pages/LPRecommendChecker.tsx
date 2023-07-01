import { Stack, Table } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { batch, signal } from "@preact/signals";
import SSBadge from "../components/SSBadge";
import SSButton from "../components/SSButton";
import SSLink from "../components/SSLink";
import SSScolllable from "../components/SSScollable";
import SSText from "../components/SSText";
import SSTextInput from "../components/SSTextInput";
import {
  CheckItem,
  CheckRequest,
  CheckResponse,
} from "../models/LPRecommendChecker/CheckResult";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { getDatetime, parseTime } from "../utils/timeHelper";

const articleURL = signal("");
const hasResult = signal(false);
const isLoading = signal(false);
const articleTitle = signal("");
const releaseTime = signal<Date | undefined>(undefined);
const releaseTimeHumanReadable = signal("");
const checkPassed = signal(false);
const checkItems = signal<CheckItem[]>([]);

function handleCheck() {
  if (articleURL.value.length === 0) {
    notifications.show({
      message: "请输入文章链接",
      color: "blue",
    });
    return;
  }

  fetchData<CheckRequest, CheckResponse>(
    "POST",
    "/tools/LP_recommend_checker/check",
    {
      article_url: articleURL.value,
    },
    (data) =>
      batch(() => {
        articleTitle.value = data.title;
        releaseTime.value = parseTime(data.release_time);
        releaseTimeHumanReadable.value = data.release_time_human_readable;
        checkPassed.value = data.check_passed;
        checkItems.value = data.check_items;
      }),
    commonAPIErrorHandler,
    hasResult,
    isLoading
  );
}

export default function LPRecommendChecker() {
  return (
    <Stack>
      <SSTextInput label="文章链接" value={articleURL} onEnter={handleCheck} />
      <SSButton onClick={handleCheck} loading={isLoading.value}>
        查询
      </SSButton>
      {hasResult.value && (
        <>
          <SSText center>
            文章标题：
            <SSLink
              url={articleURL.value}
              label={articleTitle.value}
              isExternal
            />
          </SSText>
          <SSText center>{`发布于 ${getDatetime(releaseTime.value!)}（${
            releaseTimeHumanReadable.value
          }前）`}</SSText>
          <SSText
            color={checkPassed.value ? "text-green-600" : "text-red-500"}
            bold
            xlarge
            center
          >
            {checkPassed.value ? "符合推荐标准" : "不符合推荐标准"}
          </SSText>
          <SSScolllable>
            <Table className="min-w-[480px]">
              <thead>
                <tr>
                  <th>项目</th>
                  <th>检测结果</th>
                  <th className="min-w-fit">限制值</th>
                  <th className="min-w-fit">实际值</th>
                </tr>
              </thead>
              <tbody>
                {checkItems.value.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>
                      <SSBadge
                        className={
                          item.item_passed
                            ? "bg-green-200 text-green-600 dark:bg-green-950"
                            : "bg-red-200 text-red-500 dark:bg-red-950"
                        }
                      >
                        {item.item_passed ? "符合" : "不符合"}
                      </SSBadge>
                    </td>
                    <td>{`${item.operator} ${item.limit_value}`}</td>
                    <td>{item.actual_value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </SSScolllable>
        </>
      )}
    </Stack>
  );
}
