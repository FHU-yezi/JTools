import {
  Badge,
  Card,
  Column,
  ExternalLink,
  Grid,
  Heading2,
  LoadingArea,
  Heading3,
  LargeText,
  Row,
  SmallText,
  Text,
  useDocumentTitle,
} from "@sscreator/ui";
import { opensourcePackages, v3BetaPaticipants } from "../thanks.json";
import { Datetime } from "../utils/timeHelper";
import { useDebugProjectRecords } from "../api/thanks";

export default function ThanksPage() {
  // 设置页面标题
  useDocumentTitle("鸣谢 - 简书小工具集");

  const { data: debugProjectRecords } = useDebugProjectRecords();

  const allContributorsName = debugProjectRecords
    ? [...new Set(debugProjectRecords.records.map((item) => item.userName))]
    : [];

  return (
    <>
      <Heading2>「捉虫计划」反馈</Heading2>
      <Heading3>贡献者</Heading3>
      <LoadingArea className="h-8" loading={!debugProjectRecords}>
        <Row className="flex-wrap">
          {allContributorsName.map((name) => (
            <ExternalLink
              key={name}
              href={`https://www.jianshu.com/u/${
                debugProjectRecords!.records.find(
                  (record) => record.userName === name,
                )!.userSlug
              }`}
            >
              {name}
            </ExternalLink>
          ))}
        </Row>
      </LoadingArea>
      <Heading3>捉虫记录</Heading3>
      <LoadingArea className="h-72" loading={!debugProjectRecords}>
        <Grid cols="grid-cols-1 md:grid-cols-2">
          {debugProjectRecords?.records.map((item) => (
            <Card key={item.id} className="flex flex-col gap-3" withPadding>
              <Row gap="gap-2" itemsCenter>
                <Badge>{item.type}</Badge>
                <LargeText bold>{item.module}</LargeText>
              </Row>
              <Text>{item.description}</Text>
              <Text>{`奖励：${item.reward} 简书贝`}</Text>
              <Text color="gray">
                By{" "}
                <ExternalLink
                  href={`https://www.jianshu.com/u/${item.userSlug}`}
                >
                  {item.userName}
                </ExternalLink>{" "}
                · {new Datetime(item.date).date}
              </Text>
            </Card>
          ))}
        </Grid>
      </LoadingArea>

      <Column>
        <Heading2>v3 Beta 内测成员</Heading2>
        <Row className="flex-wrap">
          {Object.entries(v3BetaPaticipants).map(([name, url]) => (
            <ExternalLink key={name} className="inline" href={url}>
              {name}
            </ExternalLink>
          ))}
        </Row>

        <Heading2>开源库</Heading2>
        <Grid cols="grid-cols-1 sm:grid-cols-2">
          {Object.entries(opensourcePackages).map(([partName, part]) => (
            <Card key={partName} className="flex flex-col gap-2" withPadding>
              <Heading2>{partName}</Heading2>
              {part.map(({ name, desc, url }) => (
                <Text key={name}>
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
            简书小工具集 · {new Datetime().date}
          </SmallText>
        </Column>
      </Column>
    </>
  );
}
