import { useDocumentTitle } from "@mantine/hooks";
import {
  Badge,
  Card,
  Column,
  ExternalLink,
  Grid,
  Heading1,
  Heading2,
  LargeText,
  Row,
  SmallText,
  Text,
} from "@sscreator/ui";
import dayjs from "dayjs";
import {
  debugProjectRecords,
  opensourcePackages,
  v3BetaPaticipants,
} from "../thanks.json";
import { getDate } from "../utils/timeHelper";

export default function ThanksPage() {
  // 设置页面标题
  useDocumentTitle("鸣谢 - 简书小工具集");

  const allContributorsName = [
    ...new Set(debugProjectRecords.map((item) => item.user_name)),
  ];

  return (
    <Column>
      <Heading1>「捉虫计划」反馈</Heading1>
      <Heading2>贡献者</Heading2>
      <Row className="flex-wrap">
        {allContributorsName.map((item) => (
          <ExternalLink
            href={
              debugProjectRecords.find((record) => record.user_name === item)!
                .user_url
            }
          >
            {item}
          </ExternalLink>
        ))}
      </Row>
      <Heading2>捉虫记录</Heading2>
      <Grid cols="grid-cols-1 md:grid-cols-2">
        {debugProjectRecords.reverse().map((item) => (
          <Card className="flex flex-col gap-3" withPadding>
            <Row gap="gap-2" itemsCenter>
              <Badge>{item.type}</Badge>
              <LargeText bold>{item.module}</LargeText>
            </Row>
            <Text>{item.desc}</Text>
            <Text>{`奖励：${item.reward} 简书贝`}</Text>
            <Text colorScheme="gray">
              By{" "}
              <ExternalLink href={item.user_url}>{item.user_name}</ExternalLink>{" "}
              @ {item.time}
            </Text>
          </Card>
        ))}
      </Grid>

      <Column>
        <Heading1>v3 Beta 内测成员</Heading1>
        <Row className="flex-wrap">
          {Object.entries(v3BetaPaticipants).map(([name, url]) => (
            <ExternalLink className="inline" href={url}>
              {name}
            </ExternalLink>
          ))}
        </Row>

        <Heading1>开源库</Heading1>
        <Grid cols="grid-cols-1 sm:grid-cols-2">
          {Object.entries(opensourcePackages).map(([partName, part]) => (
            <Card className="flex flex-col gap-2" withPadding>
              <Heading2>{partName}</Heading2>
              {part.map(({ name, desc, url }) => (
                <Text>
                  {desc}：<ExternalLink href={url}>{name}</ExternalLink>
                </Text>
              ))}
            </Card>
          ))}
        </Grid>

        <Column gap="gap-2">
          <LargeText className="text-center">
            感谢为简书生态奉献的你。
          </LargeText>
          <LargeText className="text-center">探索未知。</LargeText>
          <SmallText className="text-center">
            简书小工具集 @ {getDate(dayjs())}
          </SmallText>
        </Column>
      </Column>
    </Column>
  );
}
