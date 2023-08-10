import { useDocumentTitle } from "@mantine/hooks";
import { batch, useSignal } from "@preact/signals";
import clsx from "clsx";
import type { Dayjs } from "dayjs";
import type { JSX } from "preact";
import { Suspense, useEffect } from "preact/compat";
import { useLocation } from "wouter-preact";
import type { InfoRequest, InfoResponse } from "../models/info";
import { InfoStatus } from "../models/info";
import { getToolSlug } from "../utils/URLHelper";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { getDateTimeWithoutSecond, parseTime } from "../utils/timeHelper";
import { toastWarning } from "../utils/toastHelper";
import Header from "./Header";
import LoadingPage from "./LoadingPage";
import SSButton from "./SSButton";
import SSExternalLink from "./SSExternalLink";
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
  const reason = useSignal<string | undefined>(undefined);
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
    fetchData<InfoRequest, InfoResponse>(
      "GET",
      "/info",
      {
        tool_slug: getToolSlug(),
      },
      (data) => {
        batch(() => {
          toolStatus.value = data.status;
          reason.value = data.reason;
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
          toastWarning(
            `服务降级\n${
              reason.value ??
              "该小工具处于降级状态，其数据准确性、展示效果及性能可能受到影响，请您留意。"
            }`,
            4000,
          );
        }

        if (toolStatus.value === InfoStatus.UNAVALIABLE) {
          showUnavaliableModal.value = true;
        }
      },
      commonAPIErrorHandler,
      isLoading,
    );
  }, []);

  return (
    <>
      <Header toolName={toolName} />
      {!isLoading.value ? (
        <>
          <div
            className={clsx("flex gap-6", {
              "my-4":
                dataUpdateTime.value !== undefined &&
                dataCount.value !== undefined,
            })}
          >
            {dataUpdateTime.value !== undefined && (
              <SSStat
                className="flex-grow"
                title="数据更新时间"
                value={getDateTimeWithoutSecond(dataUpdateTime.value!)}
                desc={dataUpdateFreqDesc.value}
              />
            )}
            {dataCount.value !== undefined && (
              <SSStat
                className="flex-grow"
                title="总数据量"
                value={dataCount.value}
              />
            )}
          </div>
          {dataSource.value !== undefined && (
            <div className="my-4 flex flex-col gap-1">
              <SSText bold>数据来源</SSText>
              {Object.entries(dataSource.value).map(([name, url]) => (
                <SSExternalLink label={name} url={url} openInNewTab />
              ))}
            </div>
          )}

          <Suspense fallback={<LoadingPage />}>
            {!isLoading.value && <Component />}
          </Suspense>
        </>
      ) : (
        <LoadingPage />
      )}

      <SSModal
        isOpen={showUnavaliableModal}
        onClose={() => null}
        title="服务不可用"
        hideCloseButton
        preventCloseByClickMask
        preventCloseByEsc
      >
        <div className="flex flex-col gap-4 p-2">
          <SSText>
            {reason.value ??
              "该小工具暂时不可用，请稍后再尝试访问，并留意相关公告。"}
          </SSText>
          <SSButton light onClick={() => setLocation("/")}>
            返回首页
          </SSButton>
        </div>
      </SSModal>
    </>
  );
}
