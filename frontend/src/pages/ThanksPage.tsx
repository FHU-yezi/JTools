import { useDocumentTitle } from "@mantine/hooks";
import { Card, Column, ExternalLink, Grid, Text } from "@sscreator/ui";
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

      <Text large bold>
        「捉虫计划」反馈
      </Text>
      <Grid cols="grid-cols-1 sm:grid-cols-2">
        {debugProjectRecords.reverse().map((item) => (
          <Card>
            <Column gap="gap-3">
              <Column gap="gap-0.5">
                <Text bold>{item.type}</Text>
                <Text gray small>
                  {item.module}
                </Text>
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

      <Text large bold>
        开源库
      </Text>
      <Grid cols="grid-cols-1 sm:grid-cols-2">
        {Object.entries(opensourcePackages).map(([partName, part]) => (
          <Card>
            <Column gap="gap-3">
              <Text large bold>
                {partName}
              </Text>
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
          <Text large bold>
            v3 Beta 内测成员
          </Text>
          <Text small gray>
            排名不分先后
          </Text>
        </Column>
        {Object.entries(v3BetaPaticipants).map(([name, url]) => (
          <Text>
            {name}
            ：
            <ExternalLink href={url} />
          </Text>
        ))}

        <div className="h-16" />
        <Text large center>
          还有，感谢为简书生态奉献的你。
        </Text>
      </Column>
    </Column>
  );
}
