import { useComputed } from "@preact/signals";
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
import { useLocation } from "wouter-preact";
import { useToolStatus } from "../api/status";
import { getToolSlug } from "../utils/URLHelper";
import { Datetime } from "../utils/timeHelper";

export default function ToolMetaInfo() {
  const [, setLocation] = useLocation();
  const { data: toolStatus } = useToolStatus({ toolSlug: getToolSlug() });
  const showUnavailableModal = useComputed(() =>
    toolStatus ? toolStatus.status === "UNAVAILABLE" : false,
  );

  return (
    <>
      {toolStatus && (
        <Grid cols="grid-cols-1 sm:grid-cols-2" gap="gap-2">
          {toolStatus.lastUpdateTime && (
            <Row gap="gap-1" itemsCenter>
              <Icon color="gray" icon="i-mdi-access-time" />
              <SmallText color="gray">
                最后更新时间：
                {new Datetime(toolStatus.lastUpdateTime).datetimeWithoutSecond}
              </SmallText>
            </Row>
          )}
          {toolStatus.dataUpdateFreq && (
            <Row gap="gap-1" itemsCenter>
              <Icon color="gray" icon="i-mdi-upload" />
              <SmallText color="gray" nowrap>
                更新频率：{toolStatus.dataUpdateFreq}
              </SmallText>
            </Row>
          )}
          {toolStatus.dataCount && (
            <Row gap="gap-1" itemsCenter>
              <Icon color="gray" icon="i-mdi-database-outline" />
              <SmallText color="gray">数据量：{toolStatus.dataCount}</SmallText>
            </Row>
          )}
          {toolStatus.dataSource && (
            <Row gap="gap-1" itemsCenter>
              <Icon color="gray" icon="i-mdi-link" />
              <SmallText color="gray">
                数据来源：
                {Object.entries(toolStatus.dataSource).map(([name, url]) => (
                  <ExternalLink key={name} href={url}>
                    {name}
                  </ExternalLink>
                ))}
              </SmallText>
            </Row>
          )}
        </Grid>
      )}

      {toolStatus?.status === "DOWNGRADED" && (
        <Notice color="warning" title="服务降级">
          <Text>
            {toolStatus?.reason ??
              "该小工具处于降级状态，其功能、数据准确性和性能可能受到影响，请您留意。"}
          </Text>
        </Notice>
      )}

      <Modal open={showUnavailableModal} title="服务不可用" notCloseable>
        <Column>
          <Text>
            {toolStatus?.reason ??
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
