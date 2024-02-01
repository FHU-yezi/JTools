import { batch, useSignal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  Grid,
  Icon,
  Modal,
  Notice,
  Row,
  SmallText,
  SolidButton,
  Text,
} from "@sscreator/ui";
import { useEffect } from "preact/hooks";
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

export default function ToolMetaInfo() {
  const [, setLocation] = useLocation();

  const toolStatus = useSignal<GetToolStatusResponse | null>(null);
  const showDowngradeNotice = useSignal(false);
  const showUnavaliableModal = useSignal(false);

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
    <Column className="mb-4">
      {toolStatus.value && (
        <Grid cols="grid-cols-1 sm:grid-cols-2" gap="gap-2">
          {toolStatus.value.lastUpdateTime && (
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
          {toolStatus.value.dataUpdateFreq && (
            <Row gap="gap-1" itemsCenter>
              <Icon colorScheme="gray" icon={<MdOutlineUpload size={18} />} />
              <SmallText colorScheme="gray" nowrap>
                更新频率：{toolStatus.value.dataUpdateFreq}
              </SmallText>
            </Row>
          )}
          {toolStatus.value.dataCount && (
            <Row gap="gap-1" itemsCenter>
              <Icon colorScheme="gray" icon={<MdOutlineNumbers size={18} />} />
              <SmallText colorScheme="gray">
                数据量：{toolStatus.value.dataCount}
              </SmallText>
            </Row>
          )}
          {toolStatus.value.dataSource && (
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
      )}

      {showDowngradeNotice.value && (
        <Notice colorScheme="warning" title="服务降级">
          <Text>
            {toolStatus.value?.reason ??
              "该小工具处于降级状态，其功能、数据准确性和性能可能受到影响，请您留意。"}
          </Text>
        </Notice>
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
    </Column>
  );
}
