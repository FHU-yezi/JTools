import {
  Badge,
  Card,
  Column,
  ExternalLink,
  Grid,
  Heading2,
  LoadingArea,
  Heading3,
  Select,
  LargeText,
  Row,
  SmallText,
  Text,
  useDocumentTitle,
} from "@sscreator/ui";
import { Datetime } from "../utils/timeHelper";
import { useDebugProjectRecords, useTechStacks } from "../api/thanks";
import { userSlugToUrl } from "../utils/jianshuHelper";
import { signal } from "@preact/signals";

const v3BetaPaticipants: Record<string, string> = {
  "6g 选手": "https://www.jianshu.com/u/43c3a5c5aca3",
  海泩: "https://www.jianshu.com/u/22784ff6c0aa",
  睿希颖瑶: "https://www.jianshu.com/u/4b86da352f87",
  晨曦载曜: "https://www.jianshu.com/u/da53b65bacb8",
  晴源: "https://www.jianshu.com/u/362ee17accd1",
  白首卧松云: "https://www.jianshu.com/u/2350b4ff48ed",
  侏罗纪的天空: "https://www.jianshu.com/u/7a6bf1236c8c",
  幽夜蛙: "https://www.jianshu.com/u/e3d9895f67a7",
};

const techstackScope = signal<"frontend" | "backend" | "toolchain" | undefined>(
  undefined,
);

export default function ThanksPage() {
  // 设置页面标题
  useDocumentTitle("鸣谢 - 简书小工具集");

  const { data: debugProjectRecords } = useDebugProjectRecords();
  const { data: techStacks } = useTechStacks({ scope: techstackScope.value });

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
              href={userSlugToUrl(
                debugProjectRecords!.records.find(
                  (record) => record.userName === name,
                )!.userSlug,
              )}
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
                <ExternalLink href={userSlugToUrl(item.userSlug)}>
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

        <Heading2>技术栈</Heading2>
        <Select
          id="techstack-scope"
          label="范围"
          value={techstackScope}
          options={[
            { label: "全部", value: undefined },
            { label: "前端", value: "frontend" },
            { label: "后端", value: "backend" },
            { label: "工具链", value: "toolchain" },
          ]}
        />
        <LoadingArea className="h-72" loading={!techStacks}>
          <Grid cols="grid-cols-1 sm:grid-cols-2">
            {techStacks?.records.map((item) => (
              <Row key={item.name} gap="gap-2" itemsCenter>
                {item.isSelfDeveloped && <Badge color="success">自研</Badge>}
                <Text>{item.description}</Text>
                <ExternalLink href={item.url}>{item.name}</ExternalLink>
              </Row>
            ))}
          </Grid>
        </LoadingArea>

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
