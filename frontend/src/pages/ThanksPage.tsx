import {
  Card, Center, Space, Stack, Text, Title,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import Header from "../components/Header";
import Loading from "../components/Loading";
import SSLink from "../components/SSLink";
import { DebugProjectRecordsItem, ThanksResponse } from "../models/thanks";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";

const hasResult = signal(false);
const opensourcePackages = signal<Record<string, string>>({});
const v3BetaPaticipants = signal<Record<string, string>>({});
const debugProjectRecords = signal<DebugProjectRecordsItem[]>([]);

export default function ThanksPage() {
  // 设置页面标题
  useDocumentTitle("鸣谢 - 简书小工具集");

  useEffect(() => {
    try {
      fetchData<Record<string, never>, ThanksResponse>(
        "GET",
        "/thanks",
        {},
        (data) => {
          opensourcePackages.value = data.opensource_packages;
          v3BetaPaticipants.value = data.v3_beta_paticipants;
          debugProjectRecords.value = data.debug_project_records;
        },
        commonAPIErrorHandler,
        hasResult,
      );
    } catch {}
  }, []);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "4em",
          width: "100%",
          display: "flex",
          zIndex: 3,
        }}
      >
        <Header toolName="鸣谢" showBackArrow />
      </header>
      <div style={{ height: "3em" }} />
      {hasResult.value ? (
        <Stack>
          <Stack spacing={2}>
            <Title order={3}>v3 Beta 内测成员</Title>
            <Text size="sm" c="dimmed">排名不分先后</Text>
          </Stack>
          {Object.entries(v3BetaPaticipants.value).map(([name, url]) => (
            <Text>
              {name}
              ：
              <SSLink url={url} isExternal />
            </Text>
          ))}
          <Title order={3}>开源库</Title>
          {Object.entries(opensourcePackages.value).map(([name, url]) => (
            <Text>
              {name}
              ：
              <SSLink url={url} label={`${url.split("/")[4]} - GitHub`} isExternal />
            </Text>
          ))}
          <Title order={3}>「捉虫计划」反馈</Title>
          {debugProjectRecords.value.map((item) => (
            <Card radius="md" withBorder>
              <Stack spacing="sm">
                <Stack spacing={2}>
                  <Text size="lg" fw={600}>{`${item.time} | ${item.type}`}</Text>
                  <Text size="sm" c="dimmed">{item.module}</Text>
                </Stack>
                <Text>{item.desc}</Text>
                <Text>
                  反馈者：
                  <SSLink url={item.user_url} label={item.user_name} isExternal />
                </Text>
                <Text>{`奖励：${item.award} 简书贝`}</Text>
              </Stack>
            </Card>
          ))}
          <Space h={36} />
          <Center>
            <Text size="lg">还有，感谢为简书生态奉献的你。</Text>
          </Center>
        </Stack>
      ) : <Loading />}
    </>
  );
}
