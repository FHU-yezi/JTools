import { routes } from "../Routes";
import { Title, Stack } from "@mantine/core";
import ToolCard from "../components/ToolCard";

export default function MainPage() {
  return (
    <>
      <Title>简书小工具集</Title>
      <Stack mt={32}>
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
