import { useDocumentTitle } from "@mantine/hooks";
import { batch, signal } from "@preact/signals";
import { Column } from "@sscreator/ui";
import { useEffect } from "preact/hooks";
import { useLocation } from "wouter-preact";
import {
  V2RedirectRoutes,
  V2UnavaliableRoutes,
  V2UnimplementedRoutes,
} from "../V2RedirectRoutes";
import Header from "../components/Header";
import ToolCard from "../components/ToolCard";
import type { GetResponse } from "../models/status";
import { routes } from "../routes";
import { sendRequest } from "../utils/sendRequest";
import umamiTrack from "../utils/umamiTrack";

const downgradedTools = signal<string[]>([]);
const unavaliableTools = signal<string[]>([]);

function handleV2Redirect(
  appName: string,
  setLocation: (location: string) => void,
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
    sendRequest<Record<string, never>, GetResponse>({
      method: "GET",
      endpoint: "/v1/status",
      onSuccess: ({ data }) =>
        batch(() => {
          downgradedTools.value = data.downgradedTools;
          unavaliableTools.value = data.unavaliableTools;
        }),
    });
  }, []);

  return (
    <>
      <Header toolName="简书小工具集" hideBackArrow showIcon />
      <Column>
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
      </Column>
    </>
  );
}
