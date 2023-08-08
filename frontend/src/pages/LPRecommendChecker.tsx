import { batch, signal } from "@preact/signals";
import type { Dayjs } from "dayjs";
import SSBadge from "../components/SSBadge";
import SSButton from "../components/SSButton";
import SSCenter from "../components/SSCenter";
import SSExternalLink from "../components/SSExternalLink";
import SSTable from "../components/SSTable";
import SSText from "../components/SSText";
import SSTextInput from "../components/SSTextInput";
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
    isLoading
  );
}

export default function LPRecommendChecker() {
  return (
    <div className="flex flex-col gap-4">
      <SSTextInput label="文章链接" value={articleURL} onEnter={handleCheck} />
      <SSButton onClick={handleCheck} loading={isLoading.value}>
        查询
      </SSButton>

      {articleTitle.value !== undefined && articleURL.value !== undefined && (
        <SSText center>
          文章标题：
          <SSExternalLink
            url={articleURL.value}
            label={articleTitle.value}
            openInNewTab
          />
        </SSText>
      )}
      {releaseTime.value !== undefined && (
        <SSText center>{`发布于 ${getDatetime(
          releaseTime.value!
        )}（${getHumanReadableTimeDelta(releaseTime.value!)}）`}</SSText>
      )}
      {checkPassed.value !== undefined && (
        <SSText
          color={checkPassed.value ? "text-green-600" : "text-red-500"}
          bold
          xlarge
          center
        >
          {checkPassed.value ? "符合推荐标准" : "不符合推荐标准"}
        </SSText>
      )}
      {checkItems.value !== undefined && (
        <SSTable
          className="min-w-[540px]"
          data={checkItems.value.map((item) => ({
            项目: <SSText center>{item.name}</SSText>,
            检测结果: (
              <SSCenter>
                <SSBadge
                  className={
                    item.item_passed
                      ? "bg-green-200 text-green-600 dark:bg-green-950"
                      : "bg-red-200 text-red-500 dark:bg-red-950"
                  }
                >
                  {item.item_passed ? "符合" : "不符合"}
                </SSBadge>
              </SSCenter>
            ),
            限制值: (
              <SSText center>
                {item.operator} {item.limit_value}
              </SSText>
            ),
            实际值: <SSText center>{item.actual_value}</SSText>,
          }))}
          tableItemKey="name"
        />
      )}
    </div>
  );
}
