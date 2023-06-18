import {
  Badge,
  Box, Card, Group, Space, Text, UnstyledButton,
} from "@mantine/core";
import { AiOutlineArrowRight } from "react-icons/ai";
import { useLocation } from "wouter-preact";

interface Props {
  toolName: string;
  path: string;
  description: string;
  downgraded: boolean;
  unavaliable: boolean;
}

export default function ToolCard({
  toolName, path, description, downgraded, unavaliable,
}: Props) {
  const [, setLocation] = useLocation();
  return (
    <UnstyledButton onClick={!unavaliable ? () => setLocation(path) : undefined}>
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
                {downgraded && <Badge color="orange" radius="sm" size="lg">降级</Badge>}
                {unavaliable && <Badge color="red" radius="sm" size="lg">不可用</Badge>}
              </Group>
            </Box>
            <Space h="md" />
            <Text>{description}</Text>
          </Box>
          {!unavaliable && <AiOutlineArrowRight size={24} />}
        </Box>
      </Card>
    </UnstyledButton>
  );
}
