import { useDocumentTitle } from "@mantine/hooks";
import { batch, useSignal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  Grid,
  Icon,
  LoadingPage,
  Modal,
  PrimaryButton,
  Row,
  Text,
  WarningAlert,
} from "@sscreator/ui";
import type { JSX } from "preact";
import { Suspense, useEffect } from "preact/compat";
import {
  MdOutlineAccessTime,
  MdOutlineLink,
  MdOutlineNumbers,
  MdOutlineUpload,
} from "react-icons/md";
import { useLocation } from "wouter-preact";
import type { GetToolStatusResponse } from "../models/status";
import { ToolStatusEnum } from "../models/status";
import { getToolSlug } from "../utils/URLHelper";
import { sendRequest } from "../utils/sendRequest";
import { getDateTimeWithoutSecond, parseTime } from "../utils/timeHelper";
import Header from "./Header";

interface Props {
  Component(): JSX.Element;
  toolName: string;
}

export default function ToolWrapper({ Component, toolName }: Props) {
  const [, setLocation] = useLocation();

  const toolStatus = useSignal<GetToolStatusResponse | undefined>(undefined);
  const showDowngradeNotice = useSignal(false);
  const showUnavaliableModal = useSignal(false);

  // 设置页面标题
  useDocumentTitle(`${toolName} - 简书小工具集`);

  // 处理部分情况下页面切换后不在顶部的问题
  useEffect(() => window.scrollTo(0, 0), []);

  useEffect(() => {
    sendRequest<Record<string, never>, GetToolStatusResponse>({
      method: "GET",
      endpoint: `/v1/status/${getToolSlug()}`,
      onSuccess: ({ data }) =>
        batch(() => {
          toolStatus.value = data;

          if (data.status === ToolStatusEnum.DOWNGRADED) {
            showDowngradeNotice.value = true;
          } else if (data.status === ToolStatusEnum.UNAVALIABLE) {
            showUnavaliableModal.value = true;
          }
        }),
    });
  }, []);

  return (
    <>
      <Header toolName={toolName} />
      {toolStatus.value !== undefined ? (
        <Column>
          <Grid cols="grid-cols-1 sm:grid-cols-2" gap="gap-2">
            {toolStatus.value.dataUpdateTime !== null && (
              <Row gap="gap-1" verticalCenter>
                <Icon iconColor="text-zinc-500 dark:text-zinc-400">
                  <MdOutlineAccessTime size={18} />
                </Icon>
                <Text gray small>
                  更新时间：
                  {getDateTimeWithoutSecond(
                    parseTime(toolStatus.value.dataUpdateTime),
                  )}
                </Text>
              </Row>
            )}
            {toolStatus.value.dataUpdateFreq !== null && (
              <Row gap="gap-1" verticalCenter>
                <Icon iconColor="text-zinc-500 dark:text-zinc-400">
                  <MdOutlineUpload size={18} />
                </Icon>
                <Text gray small nowrap>
                  {toolStatus.value.dataUpdateFreq}
                </Text>
              </Row>
            )}
            {toolStatus.value.dataCount !== null && (
              <Row gap="gap-1" verticalCenter>
                <Icon iconColor="text-zinc-500 dark:text-zinc-400">
                  <MdOutlineNumbers size={18} />
                </Icon>
                <Text gray small>
                  数据量：{toolStatus.value.dataCount}
                </Text>
              </Row>
            )}
            {toolStatus.value.dataSource !== null && (
              <Row gap="gap-1" verticalCenter>
                <Icon iconColor="text-zinc-500 dark:text-zinc-400">
                  <MdOutlineLink size={18} />
                </Icon>
                <Text gray small>
                  数据来源：
                  {Object.entries(toolStatus.value.dataSource).map(
                    ([name, url]) => (
                      <ExternalLink href={url}>{name}</ExternalLink>
                    ),
                  )}
                </Text>
              </Row>
            )}
          </Grid>
          {showDowngradeNotice.value && (
            <WarningAlert>
              <Column gap="gap-2">
                <Text large bold>
                  服务降级
                </Text>
                <Text>
                  {toolStatus.value?.reason ??
                    "该小工具处于降级状态，其功能、数据准确性和性能可能受到影响，请您留意。"}
                </Text>
              </Column>
            </WarningAlert>
          )}

          <Suspense fallback={<LoadingPage />}>
            {toolStatus.value !== undefined && <Component />}
          </Suspense>
        </Column>
      ) : (
        <LoadingPage />
      )}

      <Modal
        open={showUnavaliableModal}
        title="服务不可用"
        hideCloseButton
        preventCloseByClickMask
      >
        <Column>
          <Text>
            {toolStatus.value?.reason ??
              "该小工具暂时不可用，请稍后再尝试访问，并留意相关公告。"}
          </Text>
          <PrimaryButton onClick={() => setLocation("/")} fullWidth>
            返回首页
          </PrimaryButton>
        </Column>
      </Modal>
    </>
  );
}
