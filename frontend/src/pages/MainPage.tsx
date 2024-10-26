import { useEffect } from "preact/hooks";
import { useLocation } from "wouter-preact";
import ToolCard from "../components/ToolCard";
import { useStatus } from "../api/status";
import { tools } from "../routes";
import umamiTrack from "../utils/umamiTrack";
import {
  v2RedirectRoutes,
  v2UnavailableRoutes,
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
    umamiTrack("v2-redirect", { from: appName, to: "/under-development" });
    setLocation("/under-development");
    return;
  }

  if (v2UnavailableRoutes.includes(appName)) {
    umamiTrack("v2-redirect", { from: appName, to: "/no-longer-available" });
    setLocation("/no-longer-available");
  }
}

export default function MainPage() {
  const [, setLocation] = useLocation();
  const { data: toolStatus } = useStatus();

  useEffect(() => {
    const queryArguments = new URLSearchParams(window.location.search);
    const V2AppName = queryArguments.get("app");
    if (V2AppName) {
      handleV2Redirect(V2AppName, setLocation);
    }
  }, []);

  return (
    <>
      {tools.map((item) => (
        <ToolCard
          key={item.pageName}
          toolName={item.pageName}
          path={item.path}
          description={item.description}
          downgraded={
            toolStatus?.downgradedTools.includes(item.path.slice(1)) ?? false
          }
          unavailable={
            toolStatus?.unavailableTools.includes(item.path.slice(1)) ?? false
          }
        />
      ))}
    </>
  );
}
