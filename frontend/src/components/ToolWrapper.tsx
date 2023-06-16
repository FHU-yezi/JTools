import { Flex } from "@mantine/core";
import { batch, useSignal } from "@preact/signals";
import { JSX, Suspense, useEffect } from "preact/compat";
import { InfoRequest, InfoResponse, InfoStatus } from "../models/info";
import { getToolSlug } from "../utils/URLHelper";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { getDatetime, parseTime } from "../utils/timeHelper";
import Header from "./Header";
import Loading from "./Loading";
import SSStat from "./SSStat";

interface Props {
  Component: () => JSX.Element;
  toolName: string;
}

export default function ToolWrapper({ Component, toolName }: Props) {
  const isLoading = useSignal(false);
  const hasResult = useSignal(false);
  const toolStatus = useSignal(InfoStatus.NORMAL);
  const unavaliableReason = useSignal("");
  const downgradedReason = useSignal("");
  const dataUpdateTime = useSignal<Date | undefined>(undefined);
  const dataUpdateFreqDesc = useSignal<string | undefined>(undefined);
  const dataCount = useSignal<number | undefined>(undefined);

  // 处理部分情况下页面切换后不在顶部的问题
  useEffect(() => window.scrollTo(0, 0));

  useEffect(() => {
    try {
      fetchData<InfoRequest, InfoResponse>(
        "GET",
        "/info",
        {
          tool_slug: getToolSlug(),
        },
        (data) => {
          batch(() => {
            toolStatus.value = data.status;
            unavaliableReason.value = data.unavaliable_reason;
            downgradedReason.value = data.downgraded_reason;
            if (data.data_update_time) {
              dataUpdateTime.value = parseTime(data.data_update_time);
              dataUpdateFreqDesc.value = data.data_update_freq_desc!;
            }
            if (data.data_count) {
              dataCount.value = data.data_count;
            }
          });
        },
        commonAPIErrorHandler,
        hasResult,
        isLoading,
      );
    } catch {}
  }, []);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "4em",
          width: "100%",
          display: "flex",
          zIndex: 3,
        }}
      >
        <Header toolName={toolName} showBackArrow />
      </header>
      <div style={{ height: "3em" }} />
      <Suspense fallback={<Loading />}>
        {hasResult.value ? (
          <>
            <Flex
              gap={24}
              my={typeof dataUpdateTime.value !== "undefined" || typeof dataCount.value !== "undefined" ? 16 : 0}
            >
              {typeof dataUpdateTime.value !== "undefined" && (
              <SSStat
                title="数据更新时间"
                value={getDatetime(dataUpdateTime.value!)}
                desc={dataUpdateFreqDesc.value}
              />
              )}
              {typeof dataCount.value !== "undefined" && (
              <SSStat title="数据量" value={dataCount.value} />
              )}
            </Flex>
            <Component />
          </>
        ) : <Loading />}
      </Suspense>
    </>
  );
}
