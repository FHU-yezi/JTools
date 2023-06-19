import {
  Button, Flex, Modal, Stack, Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { batch, useSignal } from "@preact/signals";
import { JSX, Suspense, useEffect } from "preact/compat";
import { AiOutlineArrowDown } from "react-icons/ai";
import { useLocation } from "wouter-preact";
import { InfoRequest, InfoResponse, InfoStatus } from "../models/info";
import { getToolSlug } from "../utils/URLHelper";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import { getDateTimeWithoutSecond, parseTime } from "../utils/timeHelper";
import Header from "./Header";
import Loading from "./Loading";
import SSLink from "./SSLink";
import SSStat from "./SSStat";

interface Props {
  Component: () => JSX.Element;
  toolName: string;
}

export default function ToolWrapper({ Component, toolName }: Props) {
  const [, setLocation] = useLocation();

  const isLoading = useSignal(false);
  const hasResult = useSignal(false);
  const toolStatus = useSignal(InfoStatus.NORMAL);
  const unavaliableReason = useSignal("");
  const downgradedReason = useSignal("");
  const dataUpdateTime = useSignal<Date | undefined>(undefined);
  const dataUpdateFreqDesc = useSignal<string | undefined>(undefined);
  const dataCount = useSignal<number | undefined>(undefined);
  const dataSource = useSignal<Record<string, string> | undefined>({});
  const showUnavaliableModal = useSignal(false);

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
            notifications.show({
              title: "服务降级",
              message: downgradedReason.value.length !== 0
                ? downgradedReason.value
                : "该小工具处于降级状态，其数据准确性、展示效果及性能可能受到影响，请您留意。",
              color: "orange",
              autoClose: false,
              icon: <AiOutlineArrowDown size="1.2em" color="white" />,
            });
          }
          if (toolStatus.value === InfoStatus.UNAVALIABLE) {
            showUnavaliableModal.value = true;
          }
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
                value={getDateTimeWithoutSecond(dataUpdateTime.value!)}
                desc={dataUpdateFreqDesc.value}
              />
              )}
              {typeof dataCount.value !== "undefined" && (
              <SSStat title="总数据量" value={dataCount.value} />
              )}
            </Flex>
            {typeof dataSource.value !== "undefined" && (
            <Stack spacing={4} my={16}>
              <Text fw={600}>数据来源</Text>
              {Object.entries(dataSource.value).map(([name, url]) => (
                <Text>
                  {name}
                  ：
                  <SSLink url={url} isExternal />
                </Text>
              ))}
            </Stack>
            )}
            <Component />
          </>
        ) : <Loading />}
      </Suspense>
      <Modal
        opened={showUnavaliableModal.value}
        onClose={() => null}
        title="服务不可用"
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
      >
        <Stack>
          {unavaliableReason.value.length !== 0
            ? unavaliableReason.value
            : "该小工具由于数据准确性、体验或安全性等原因暂时不可用，请稍后再尝试访问，并留意相关公告。"}
          <Button
            variant="light"
            onClick={() => setLocation("/")}
          >
            返回首页
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
