import { Stack } from "@mantine/core";
import { routes } from "../Routes";
import Header from "../components/Header";
import ToolCard from "../components/ToolCard";

export default function MainPage() {
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
        }}
      >
        <Header toolName="简书小工具集" showBackArrow={false} />
      </header>
      <div style={{ height: "4em" }} />
      <Stack>
        {routes.map((item) => (
          <ToolCard
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
