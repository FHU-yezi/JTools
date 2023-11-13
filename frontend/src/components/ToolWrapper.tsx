import { useDocumentTitle } from "@mantine/hooks";
import { batch, useSignal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  FieldBlock,
  LoadingPage,
  Modal,
  PrimaryButton,
  Row,
  Text,
  WarningAlert,
} from "@sscreator/ui";
import type { Dayjs } from "dayjs";
import type { JSX } from "preact";
import { Suspense, useEffect } from "preact/compat";
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

  const isLoading = useSignal(false);
  const toolStatus = useSignal<ToolStatusEnum | undefined>(undefined);
  const reason = useSignal<string | undefined>(undefined);
  const dataUpdateTime = useSignal<Dayjs | null | undefined>(undefined);
  const dataUpdateFreqDesc = useSignal<string | undefined>(undefined);
  const dataCount = useSignal<number | undefined>(undefined);
  const dataSource = useSignal<Record<string, string> | undefined>({});
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
          toolStatus.value = data.status;
          reason.value = data.reason;
          dataSource.value = data.dataSource;
          dataUpdateTime.value = data.dataUpdateTime
            ? parseTime(data.dataUpdateTime)
            : null;
          dataUpdateFreqDesc.value = data.dataUpdateFreq;
          dataCount.value = data.dataCount;

          if (toolStatus.value === ToolStatusEnum.DOWNGRADED) {
            showDowngradeNotice.value = true;
          }

          if (toolStatus.value === ToolStatusEnum.UNAVALIABLE) {
            showUnavaliableModal.value = true;
          }
        }),
      isLoading,
    });
  }, []);

  return (
    <>
      <Header toolName={toolName} />
      {!isLoading.value ? (
        <Column>
          <Row gap="gap-6">
            {dataUpdateTime.value && (
              <FieldBlock rowClassName="flex-1" fieldName="数据更新时间">
                <Text>{getDateTimeWithoutSecond(dataUpdateTime.value!)}</Text>
                <Text gray small>
                  {dataUpdateFreqDesc.value}
                </Text>
              </FieldBlock>
            )}
            {dataCount.value && (
              <FieldBlock rowClassName="flex-1" fieldName="总数据量">
                <Text>{dataCount.value}</Text>
              </FieldBlock>
            )}
          </Row>
          {dataSource.value && (
            <Column gap="gap-1">
              <Text bold>数据来源</Text>
              {Object.entries(dataSource.value).map(([name, url]) => (
                <ExternalLink href={url}>{name}</ExternalLink>
              ))}
            </Column>
          )}
          {showDowngradeNotice.value && (
            <WarningAlert>
              <Column gap="gap-2">
                <Text large bold>
                  服务降级
                </Text>
                <Text>
                  {reason.value ??
                    "该小工具处于降级状态，其功能、数据准确性和性能可能受到影响，请您留意。"}
                </Text>
              </Column>
            </WarningAlert>
          )}

          <Suspense fallback={<LoadingPage />}>
            {!isLoading.value && <Component />}
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
            {reason.value ??
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
