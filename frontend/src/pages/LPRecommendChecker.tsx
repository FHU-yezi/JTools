import { batch, signal } from "@preact/signals";
import {
  Badge,
  Center,
  Column,
  ExternalLink,
  PrimaryButton,
  Table,
  TableBody,
  TableHeader,
  TableRow,
  Text,
  TextInput,
} from "@sscreator/ui";
import clsx from "clsx";
import type { Dayjs } from "dayjs";
import type {
  CheckItem,
  CheckRequest,
  CheckResponse,
} from "../models/LPRecommendChecker/CheckResult";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import {
  getDatetime,
  getHumanReadableTimeDelta,
  parseTime,
} from "../utils/timeHelper";
import { toastWarning } from "../utils/toastHelper";

const articleURL = signal("");
const isLoading = signal(false);
const articleTitle = signal<string | undefined>(undefined);
const releaseTime = signal<Dayjs | undefined>(undefined);
const checkPassed = signal<boolean | undefined>(undefined);
const checkItems = signal<CheckItem[] | undefined>(undefined);

function handleCheck() {
  if (articleURL.value.length === 0) {
    toastWarning("请输入文章链接");
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
        checkPassed.value = data.check_passed;
        checkItems.value = data.check_items;
      }),
    commonAPIErrorHandler,
    isLoading,
  );
}

export default function LPRecommendChecker() {
  return (
    <Column>
      <TextInput label="文章链接" value={articleURL} onEnter={handleCheck} />
      <PrimaryButton onClick={handleCheck} loading={isLoading.value} fullWidth>
        查询
      </PrimaryButton>

      {articleTitle.value !== undefined && articleURL.value !== undefined && (
        <Text center>
          文章标题：
          <ExternalLink href={articleURL.value}>
            {articleTitle.value}
          </ExternalLink>
        </Text>
      )}
      {releaseTime.value !== undefined && (
        <Text center>{`发布于 ${getDatetime(
          releaseTime.value!,
        )}（${getHumanReadableTimeDelta(releaseTime.value!)}）`}</Text>
      )}
      {checkPassed.value !== undefined && (
        <Text
          color={checkPassed.value ? "text-green-600" : "text-red-500"}
          bold
          large
          center
        >
          {checkPassed.value ? "符合推荐标准" : "不符合推荐标准"}
        </Text>
      )}
      {checkItems.value !== undefined && (
        <Table className="w-full">
          <TableHeader>
            <Text bold>项目</Text>
            <Text bold>检测结果</Text>
            <Text bold>实际值</Text>
            <Text bold>限制值</Text>
          </TableHeader>
          <TableBody>
            {checkItems.value.map((item) => (
              <TableRow>
                <Text center nowrap>
                  {item.name}
                </Text>
                <Center>
                  <Badge
                    backgroundColor={clsx({
                      "bg-green-200 dark:bg-green-950": item.item_passed,
                      "bg-red-200 dark:bg-red-950": !item.item_passed,
                    })}
                    textColor={clsx({
                      "text-green-600": item.item_passed,
                      "text-red-500": !item.item_passed,
                    })}
                  >
                    {item.item_passed ? "符合" : "不符合"}
                  </Badge>
                </Center>
                <Text center nowrap>
                  {item.actual_value}
                </Text>
                <Text center nowrap>
                  {item.operator} {item.limit_value}
                </Text>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        // <SSTable
        //   className="min-w-[540px]"
        //   data={checkItems.value.map((item) => ({
        //     项目: <SSText center>{item.name}</SSText>,
        //     检测结果: (
        //       <SSCenter>
        //         <Badge
        //           backgroundColor={clsx({
        //             "bg-green-200 dark:bg-green-950": item.item_passed,
        //             "bg-red-200 dark:bg-red-950": !item.item_passed,
        //           })}
        //           textColor={clsx({
        //             "text-green-600": item.item_passed,
        //             "text-red-500": !item.item_passed,
        //           })}
        //         >
        //           {item.item_passed ? "符合" : "不符合"}
        //         </Badge>
        //       </SSCenter>
        //     ),
        //     限制值: (
        //       <Text center>
        //         {item.operator} {item.limit_value}
        //       </Text>
        //     ),
        //     实际值: <Text center>{item.actual_value}</Text>,
        //   }))}
        //   tableItemKey="name"
        // />
      )}
    </Column>
  );
}
