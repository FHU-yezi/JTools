import { Badge, Group, Text } from "@mantine/core";
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
    <button
      type="button"
      className="w-full flex justify-between items-center p-5 rounded-2xl shadow border bg-white dark:bg-zinc-800 dark:border-zinc-700"
      onClick={!unavaliable ? () => setLocation(path) : undefined}
    >
      <div>
        <div>
          <Group spacing="xs">
            <Text size="lg" fw={700}>
              {toolName}
            </Text>
            {downgraded && <Badge color="orange" radius="sm" size="lg">降级</Badge>}
            {unavaliable && <Badge color="red" radius="sm" size="lg">不可用</Badge>}
          </Group>
        </div>
        <div className="h-4" />
        <Text className="text-left">{description}</Text>
      </div>
      {!unavaliable && <AiOutlineArrowRight size={24} />}
    </button>
  );
}
