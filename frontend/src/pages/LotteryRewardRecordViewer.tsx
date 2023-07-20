import { Chip } from "@mantine/core";
import { batch, signal } from "@preact/signals";
import { DataTable } from "mantine-datatable";
import { useEffect } from "preact/hooks";
import toast from "react-hot-toast";
import SSButton from "../components/SSButton";
import SSSkeleton from "../components/SSSkeleton";
import SSText from "../components/SSText";
import SSTextInput from "../components/SSTextInput";
import SSTooltip from "../components/SSTooltip";
import {
  LotteryRecordItem,
  LotteryRecordsRequest,
  LotteryRecordsResponse,
} from "../models/LotteryRewardRecordViewer/LotteryRecords";
import { RewardResponse } from "../models/LotteryRewardRecordViewer/Rewards";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { replaceAll } from "../utils/textHelper";
import { getDatetime, parseTime } from "../utils/timeHelper";

const PAGE_SIZE = 100;

const rewards = signal<string[] | undefined>(undefined);
const userURL = signal("");
const selectedRewards = signal<string[]>([]);
const isLoading = signal(false);
const result = signal<LotteryRecordItem[] | undefined>(undefined);
const resultTotalCount = signal<number | undefined>(undefined);
const currentPage = signal(1);

function handleQuery(offset: number) {
  if (userURL.value.length === 0) {
    toast("请输入用户个人主页链接", {
      icon: " ⚠️",
    });
    return;
  }

  try {
    fetchData<LotteryRecordsRequest, LotteryRecordsResponse>(
      "POST",
      "/tools/lottery_reward_record_viewer/lottery_records",
      {
        user_url: userURL.value,
        target_rewards: selectedRewards.value,
        offset,
      },
      (data) => {
        result.value = data.records;
        resultTotalCount.value = data.total;
      },
      commonAPIErrorHandler,
      isLoading
    );
  } catch {}
}

function ResultTable() {
  return (
    <DataTable
      height={600}
      records={result.value}
      columns={[
        {
          accessor: "time",
          title: "时间",
          noWrap: true,
          render: (record) => getDatetime(parseTime(record.time)),
        },
        {
          accessor: "reward_name",
          title: "奖项",
          noWrap: true,
        },
      ]}
      totalRecords={resultTotalCount.value}
      recordsPerPage={PAGE_SIZE}
      page={currentPage.value}
      onPageChange={(page) => {
        handleQuery((page - 1) * PAGE_SIZE);
        currentPage.value = page;
      }}
    />
  );
}

export default function LotteryRewardRecordViewer() {
  useEffect(() => {
    try {
      fetchData<Record<string, never>, RewardResponse>(
        "GET",
        "/tools/lottery_reward_record_viewer/rewards",
        {},
        (data) =>
          batch(() => {
            rewards.value = data.rewards;
            selectedRewards.value = data.rewards.map((item) =>
              replaceAll(item, " ", "")
            );
          }),
        commonAPIErrorHandler
      );
    } catch {}
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <SSTextInput
        label="用户个人主页链接"
        value={userURL}
        onEnter={() => handleQuery(0)}
      />
      {typeof rewards.value !== "undefined" ? (
        <>
          <SSText bold>奖项筛选</SSText>
          <Chip.Group
            value={selectedRewards.value}
            onChange={(value) => (selectedRewards.value = value)}
            multiple
          >
            <div className="flex flex-wrap gap-3">
              {rewards.value.map((item) => (
                <Chip
                  key={replaceAll(item, " ", "")}
                  value={replaceAll(item, " ", "")}
                >
                  {item}
                </Chip>
              ))}
            </div>
          </Chip.Group>
        </>
      ) : (
        <SSSkeleton className="h-16" />
      )}
      <SSTooltip tooltip="受简书接口限制，我们无法获取这两种奖品的中奖情况，故无法进行查询">
        关于免费开 1 次连载 / 锦鲤头像框
      </SSTooltip>
      <SSButton onClick={() => handleQuery(0)} loading={isLoading.value}>
        查询
      </SSButton>

      {typeof result.value !== "undefined" &&
        (result.value.length !== 0 ? (
          <ResultTable />
        ) : (
          <SSText className="m-6" bold large center>
            没有查询到数据
          </SSText>
        ))}
    </div>
  );
}
