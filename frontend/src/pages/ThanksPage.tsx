import { useDocumentTitle } from "@mantine/hooks";
import {
  Card,
  Column,
  ExternalLink,
  Grid,
  LargeText,
  SmallText,
  Text,
} from "@sscreator/ui";
import Header from "../components/Header";
import {
  debugProjectRecords,
  opensourcePackages,
  v3BetaPaticipants,
} from "../thanks.json";

export default function ThanksPage() {
  // 设置页面标题
  useDocumentTitle("鸣谢 - 简书小工具集");

  return (
    <Column>
      <Header toolName="鸣谢" />

      <LargeText bold>「捉虫计划」反馈</LargeText>
      <Grid cols="grid-cols-1 sm:grid-cols-2">
        {debugProjectRecords.reverse().map((item) => (
          <Card>
            <Column gap="gap-3">
              <Column gap="gap-0.5">
                <Text bold>{item.type}</Text>
                <SmallText colorScheme="gray">{item.module}</SmallText>
              </Column>
              <Text>{item.desc}</Text>
              <Text>
                反馈者：
                <ExternalLink href={item.user_url}>
                  {item.user_name}
                </ExternalLink>
              </Text>
              <Text>{`奖励：${item.reward} 简书贝`}</Text>
            </Column>
          </Card>
        ))}
      </Grid>

      <LargeText bold>开源库</LargeText>
      <Grid cols="grid-cols-1 sm:grid-cols-2">
        {Object.entries(opensourcePackages).map(([partName, part]) => (
          <Card>
            <Column gap="gap-3">
              <LargeText bold>{partName}</LargeText>
              {part.map(({ name, desc, url }) => (
                <Text>
                  {desc}：<ExternalLink href={url}>{name}</ExternalLink>
                </Text>
              ))}
            </Column>
          </Card>
        ))}
      </Grid>

      <Column>
        <Column gap="gap-0.5">
          <LargeText bold>v3 Beta 内测成员</LargeText>
          <SmallText colorScheme="gray">排名不分先后</SmallText>
        </Column>
        {Object.entries(v3BetaPaticipants).map(([name, url]) => (
          <Text>
            {name}：<ExternalLink href={url}>{url}</ExternalLink>
          </Text>
        ))}

        <div className="h-16" />
        <LargeText className="text-center">
          还有，感谢为简书生态奉献的你。
        </LargeText>
      </Column>
    </Column>
  );
}
