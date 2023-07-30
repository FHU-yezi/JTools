import { useDocumentTitle } from "@mantine/hooks";
import { batch, signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { useLocation } from "wouter-preact";
import {
  V2RedirectRoutes,
  V2UnavaliableRoutes,
  V2UnimplementedRoutes,
} from "../V2RedirectRoutes";
import Header from "../components/Header";
import SSTooltip from "../components/SSTooltip";
import ToolCard from "../components/ToolCard";
import type { StatusResponse } from "../models/status";
import { routes } from "../routes";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import umamiTrack from "../utils/umamiTrack";

const downgradedTools = signal<string[]>([]);
const unavaliableTools = signal<string[]>([]);

function handleV2Redirect(
  appName: string,
  setLocation: (location: string) => void
) {
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
      (data) =>
        batch(() => {
          downgradedTools.value = data.downgraded_tools;
          unavaliableTools.value = data.unavaliable_tools;
        }),
      commonAPIErrorHandler
    );
  }, []);

  return (
    <>
      <Header toolName="简书小工具集" showBackArrow={false} />
      <div className="mt-4 flex flex-col gap-4">
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

        <SSTooltip tooltip="消零派辅助工具已在小工具集 v3 中下线，我们即将发布更强大的工具，敬请期待">
          关于消零派辅助工具
        </SSTooltip>
        <SSTooltip tooltip="简书 App 中滑动到文章最后，网页端将鼠标悬浮在发布时间上即可查看文章更新时间，小工具集 v3 不再提供此工具">
          关于文章发布时间查询工具
        </SSTooltip>
      </div>
    </>
  );
}
