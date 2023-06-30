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
  toolName,
  path,
  description,
  downgraded,
  unavaliable,
}: Props) {
  const [, setLocation] = useLocation();
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-2xl border bg-white p-5 shadow dark:border-zinc-700 dark:bg-zinc-800"
      onClick={!unavaliable ? () => setLocation(path) : undefined}
    >
      <div>
        <div>
          <Group spacing="xs">
            <Text size="lg" fw={700}>
              {toolName}
            </Text>
            {downgraded && (
              <Badge color="orange" radius="sm" size="lg">
                降级
              </Badge>
            )}
            {unavaliable && (
              <Badge color="red" radius="sm" size="lg">
                不可用
              </Badge>
            )}
          </Group>
        </div>
        <div className="h-4" />
        <Text className="text-left">{description}</Text>
      </div>
      {!unavaliable && <AiOutlineArrowRight size={24} />}
    </button>
  );
}
