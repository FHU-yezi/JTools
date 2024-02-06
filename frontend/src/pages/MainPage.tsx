import { Column } from "@sscreator/ui";
import { useEffect } from "preact/hooks";
import { useLocation } from "wouter-preact";
import ToolCard from "../components/ToolCard";
import { useData } from "../hooks/useData";
import type { GetResponse } from "../models/status";
import { tools } from "../routes";
import umamiTrack from "../utils/umamiTrack";
import {
  v2RedirectRoutes,
  v2UnavaliableRoutes,
  v2UnimplementedRoutes,
} from "../v2RedirectRoutes";

function handleV2Redirect(
  appName: string,
  setLocation: (location: string) => void,
) {
  if (appName in v2RedirectRoutes) {
    umamiTrack("v2-redirect", { from: appName, to: v2RedirectRoutes[appName] });
    setLocation(v2RedirectRoutes[appName]);
    return;
  }

  if (v2UnimplementedRoutes.includes(appName)) {
    umamiTrack("v2-redirect", { from: appName, to: "/v2-unimplemented" });
    setLocation("/v2-unimplemented");
    return;
  }

  if (v2UnavaliableRoutes.includes(appName)) {
    umamiTrack("v2-redirect", { from: appName, to: "/v2-unavaliable" });
    setLocation("/v2-unavaliable");
  }
}

export default function MainPage() {
  const [, setLocation] = useLocation();
  const { data: toolStatus } = useData<Record<string, never>, GetResponse>({
    method: "GET",
    endpoint: "/v1/status",
  });

  useEffect(() => {
    const queryArguments = new URLSearchParams(window.location.search);
    const V2AppName = queryArguments.get("app");
    if (V2AppName) {
      handleV2Redirect(V2AppName, setLocation);
    }
  }, []);

  return (
    <Column>
      {tools.map((item) => (
        <ToolCard
          key={item.pageName}
          toolName={item.pageName}
          path={item.path}
          description={item.description}
          downgraded={
            toolStatus?.downgradedTools.includes(item.path.slice(1)) ?? false
          }
          unavaliable={
            toolStatus?.unavaliableTools.includes(item.path.slice(1)) ?? false
          }
        />
      ))}
    </Column>
  );
}
