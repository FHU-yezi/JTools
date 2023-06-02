import { RouteItem } from "../Routes";
import { Card, Text, Box, UnstyledButton, Space, Group } from "@mantine/core";
import { AiOutlineArrowRight } from "react-icons/ai";
import { useLocation } from "wouter-preact";

export default function ToolCard({ toolName, path, description }: RouteItem) {
  const [, setLocation] = useLocation();
  return (
    <UnstyledButton onClick={() => setLocation(path)}>
      <Card padding="lg" shadow="xs" radius="lg" p={20} withBorder>
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Box>
              <Group spacing="xs">
                <Text size="lg" fw={700}>
                  {toolName}
                </Text>
              </Group>
            </Box>
            <Space h="md" />
            <Text>{description}</Text>
          </Box>
          <AiOutlineArrowRight size={24} />
        </Box>
      </Card>
    </UnstyledButton>
  );
}
