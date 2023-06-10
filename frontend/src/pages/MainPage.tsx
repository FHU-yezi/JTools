import { Stack } from "@mantine/core";
import { useEffect } from "preact/hooks";
import { useLocation } from "wouter-preact";
import { V2RedirectRoutes, V2UnavaliableRoutes, V2UnimplementedRoutes } from "../V2RedirectRoutes";
import Header from "../components/Header";
import ToolCard from "../components/ToolCard";
import { routes } from "../routes";

// eslint-disable-next-line no-unused-vars
function handleV2Redirect(appName: string, setLocation: (location: string) => void) {
  if (appName in V2RedirectRoutes) {
    setLocation(V2RedirectRoutes[appName]);
    return;
  }

  if (V2UnimplementedRoutes.includes(appName)) {
    setLocation("/v2-unimplemented");
    return;
  }

  if (V2UnavaliableRoutes.includes(appName)) {
    setLocation("/v2-unavaliable");
  }
}

export default function MainPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const queryArguments = new URLSearchParams(window.location.search);
    const V2AppName = queryArguments.get("app");
    if (V2AppName) {
      handleV2Redirect(V2AppName, setLocation);
    }
  });

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
      <div style={{ height: "4em" }} />
      <Stack mb={32}>
        {routes.map((item) => (
          <ToolCard
            key={item.toolName}
            toolName={item.toolName}
            component={item.component}
            path={item.path}
            description={item.description}
          />
        ))}
      </Stack>
    </>
  );
}
