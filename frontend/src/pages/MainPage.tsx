import { Button, Stack, Text } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { batch, signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { useLocation } from "wouter-preact";
import { V2RedirectRoutes, V2UnavaliableRoutes, V2UnimplementedRoutes } from "../V2RedirectRoutes";
import Header from "../components/Header";
import SSTips from "../components/SSTips";
import ToolCard from "../components/ToolCard";
import { StatusResponse } from "../models/status";
import { routes } from "../routes";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import umamiTrack from "../utils/umamiTrack";

const version = signal<string | undefined>(undefined);
const downgradedTools = signal<string[]>([]);
const unavaliableTools = signal<string[]>([]);

// eslint-disable-next-line no-unused-vars
function handleV2Redirect(appName: string, setLocation: (location: string) => void) {
  if (appName in V2RedirectRoutes) {
    umamiTrack("v2-redirect", { from: appName, to: V2RedirectRoutes[appName] });
    setLocation(V2RedirectRoutes[appName]);
    return;
  }

  if (V2UnimplementedRoutes.includes(appName)) {
    umamiTrack("v2-redirect", { from: appName, to: "/v2-unimplemented" });
    setLocation("/v2-unimplemented");
    return;
  }

  if (V2UnavaliableRoutes.includes(appName)) {
    umamiTrack("v2-redirect", { from: appName, to: "/v2-unavaliable" });
    setLocation("/v2-unavaliable");
  }
}

export default function MainPage() {
  const [, setLocation] = useLocation();

  // 设置页面标题
  useDocumentTitle("简书小工具集");

  useEffect(() => {
    const queryArguments = new URLSearchParams(window.location.search);
    const V2AppName = queryArguments.get("app");
    if (V2AppName) {
      handleV2Redirect(V2AppName, setLocation);
    }
  }, []);

  useEffect(() => {
    fetchData<Record<string, never>, StatusResponse>(
      "GET",
      "/status",
      {},
      (data) => batch(() => {
        version.value = data.version;
        downgradedTools.value = data.downgraded_tools;
        unavaliableTools.value = data.unavaliable_tools;
      }),
      commonAPIErrorHandler,
    );
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
        <Header toolName="简书小工具集" showBackArrow={false} />
      </header>
      <div style={{ height: "3em" }} />
      <Stack>
        <Text size="sm" c="dimmed">
          版本：
          {version.value ?? "获取中..."}
        </Text>
        {routes.map((item) => (
          <ToolCard
            key={item.toolName}
            toolName={item.toolName}
            path={item.path}
            description={item.description}
            downgraded={downgradedTools.value.includes(item.path.slice(1))}
            unavaliable={unavaliableTools.value.includes(item.path.slice(1))}
          />
        ))}
        <Button variant="default" onClick={() => setLocation("/thanks")}>
          鸣谢 &gt;
        </Button>
        <Button
          variant="default"
          onClick={
          () => window.open(
            "https://wenjuan.feishu.cn/m?t=sjQp3W8yUrNi-g37f",
            "_blank",
          )
          }
        >
          反馈 &gt;
        </Button>
        <SSTips
          label="关于消零派辅助工具"
          content="消零派辅助工具已在小工具集 v3 中下线，我们即将发布更强大的工具，敬请期待"
          multiline
        />
        <SSTips
          label="关于文章发布时间查询工具"
          content="简书 App 中滑动到文章最后，网页端将鼠标悬浮在发布时间上即可查看文章更新时间，小工具集 v3 不再提供此工具"
          multiline
        />
      </Stack>
    </>
  );
}
