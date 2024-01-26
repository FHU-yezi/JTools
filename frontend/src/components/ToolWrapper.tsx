import { useDocumentTitle } from "@mantine/hooks";
import { batch, useSignal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  Grid,
  Icon,
  LoadingPage,
  Modal,
  Notice,
  Row,
  SmallText,
  SolidButton,
  Text,
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
import HeaderBlock from "./HeaderBlock";

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
      <HeaderBlock toolName={toolName} />
      {toolStatus.value !== undefined ? (
        <Column>
          <Grid cols="grid-cols-1 sm:grid-cols-2" gap="gap-2">
            {toolStatus.value.lastUpdateTime !== null && (
              <Row gap="gap-1" itemsCenter>
                <Icon
                  colorScheme="gray"
                  icon={<MdOutlineAccessTime size={18} />}
                />
                <SmallText colorScheme="gray">
                  最后更新时间：
                  {getDateTimeWithoutSecond(
                    parseTime(toolStatus.value.lastUpdateTime),
                  )}
                </SmallText>
              </Row>
            )}
            {toolStatus.value.dataUpdateFreq !== null && (
              <Row gap="gap-1" itemsCenter>
                <Icon colorScheme="gray" icon={<MdOutlineUpload size={18} />} />
                <SmallText colorScheme="gray" nowrap>
                  更新频率：{toolStatus.value.dataUpdateFreq}
                </SmallText>
              </Row>
            )}
            {toolStatus.value.dataCount !== null && (
              <Row gap="gap-1" itemsCenter>
                <Icon
                  colorScheme="gray"
                  icon={<MdOutlineNumbers size={18} />}
                />
                <SmallText colorScheme="gray">
                  数据量：{toolStatus.value.dataCount}
                </SmallText>
              </Row>
            )}
            {toolStatus.value.dataSource !== null && (
              <Row gap="gap-1" itemsCenter>
                <Icon colorScheme="gray" icon={<MdOutlineLink size={18} />} />
                <SmallText colorScheme="gray">
                  数据来源：
                  {Object.entries(toolStatus.value.dataSource).map(
                    ([name, url]) => (
                      <ExternalLink href={url}>{name}</ExternalLink>
                    ),
                  )}
                </SmallText>
              </Row>
            )}
          </Grid>
          {showDowngradeNotice.value && (
            <Notice colorScheme="warning" title="服务降级">
              <Text>
                {toolStatus.value?.reason ??
                  "该小工具处于降级状态，其功能、数据准确性和性能可能受到影响，请您留意。"}
              </Text>
            </Notice>
          )}

          <Suspense fallback={<LoadingPage />}>
            {toolStatus.value !== undefined && <Component />}
          </Suspense>
        </Column>
      ) : (
        <LoadingPage />
      )}

      <Modal open={showUnavaliableModal} title="服务不可用" notCloseable>
        <Column>
          <Text>
            {toolStatus.value?.reason ??
              "该小工具暂时不可用，请稍后再尝试访问，并留意相关公告。"}
          </Text>
          <SolidButton onClick={() => setLocation("/")} fullWidth>
            返回首页
          </SolidButton>
        </Column>
      </Modal>
    </>
  );
}
