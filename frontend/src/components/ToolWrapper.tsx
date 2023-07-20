import { useDocumentTitle } from "@mantine/hooks";
import { batch, useSignal } from "@preact/signals";
import clsx from "clsx";
import type { Dayjs } from "dayjs";
import type { JSX } from "preact";
import { Suspense, useEffect } from "preact/compat";
import toast from "react-hot-toast";
import { useLocation } from "wouter-preact";
import { InfoRequest, InfoResponse, InfoStatus } from "../models/info";
import { getToolSlug } from "../utils/URLHelper";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { getDateTimeWithoutSecond, parseTime } from "../utils/timeHelper";
import Header from "./Header";
import Loading from "./Loading";
import SSButton from "./SSButton";
import SSLink from "./SSLink";
import SSModal from "./SSModal";
import SSStat from "./SSStat";
import SSText from "./SSText";

interface Props {
  Component(): JSX.Element;
  toolName: string;
}

export default function ToolWrapper({ Component, toolName }: Props) {
  const [, setLocation] = useLocation();

  const isLoading = useSignal(false);
  const toolStatus = useSignal<InfoStatus | undefined>(undefined);
  const unavaliableReason = useSignal<string | undefined>(undefined);
  const downgradedReason = useSignal<string | undefined>(undefined);
  const dataUpdateTime = useSignal<Dayjs | undefined>(undefined);
  const dataUpdateFreqDesc = useSignal<string | undefined>(undefined);
  const dataCount = useSignal<number | undefined>(undefined);
  const dataSource = useSignal<Record<string, string> | undefined>({});
  const showUnavaliableModal = useSignal(false);

  // 设置页面标题
  useDocumentTitle(`${toolName} - 简书小工具集`);

  // 处理部分情况下页面切换后不在顶部的问题
  useEffect(() => window.scrollTo(0, 0), []);

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
            dataSource.value = data.data_source;
            if (data.data_update_time) {
              dataUpdateTime.value = parseTime(data.data_update_time);
              dataUpdateFreqDesc.value = data.data_update_freq_desc!;
            }
            if (data.data_count) {
              dataCount.value = data.data_count;
            }
          });

          if (toolStatus.value === InfoStatus.DOWNGRADED) {
            toast(
              `服务降级\n${
                downgradedReason.value ??
                "该小工具处于降级状态，其数据准确性、展示效果及性能可能受到影响，请您留意。"
              }`,
              {
                duration: 4000,
                icon: " 🔻",
              }
            );
          }

          if (toolStatus.value === InfoStatus.UNAVALIABLE) {
            showUnavaliableModal.value = true;
          }
        },
        commonAPIErrorHandler,
        isLoading
      );
    } catch {}
  }, []);

  return (
    <>
      <Header toolName={toolName} showBackArrow />
      {!isLoading.value ? (
        <>
          <div
            className={clsx("flex gap-6", {
              "my-4":
                typeof dataUpdateTime.value !== "undefined" &&
                typeof dataCount.value !== "undefined",
            })}
          >
            {typeof dataUpdateTime.value !== "undefined" && (
              <SSStat
                className="flex-grow"
                title="数据更新时间"
                value={getDateTimeWithoutSecond(dataUpdateTime.value!)}
                desc={dataUpdateFreqDesc.value}
              />
            )}
            {typeof dataCount.value !== "undefined" && (
              <SSStat
                className="flex-grow"
                title="总数据量"
                value={dataCount.value}
              />
            )}
          </div>
          {typeof dataSource.value !== "undefined" && (
            <div className="my-4 flex flex-col gap-1">
              <SSText bold>数据来源</SSText>
              {Object.entries(dataSource.value).map(([name, url]) => (
                <SSLink label={name} url={url} isExternal />
              ))}
            </div>
          )}

          <Suspense fallback={<Loading />}>
            {!isLoading.value && <Component />}
          </Suspense>
        </>
      ) : (
        <Loading />
      )}

      <SSModal
        isOpen={showUnavaliableModal}
        onClose={() => null}
        title="服务不可用"
        hideCloseButton
        preventCloseByClickMask
        preventCloseByEsc
      >
        <div className="flex flex-col gap-4">
          <SSText>
            {unavaliableReason.value ??
              "该小工具暂时不可用，请稍后再尝试访问，并留意相关公告。"}
          </SSText>
          <SSButton onClick={() => setLocation("/")}>返回首页</SSButton>
        </div>
      </SSModal>
    </>
  );
}
