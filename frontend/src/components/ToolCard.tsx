import { Badge, Card, Column, Icon, LargeText, Row, Text } from "@sscreator/ui";
import { useLocation } from "wouter-preact";

interface Props {
  toolName: string;
  path: string;
  description?: string;
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
      className={unavaliable ? "cursor-not-allowed" : undefined}
      onClick={!unavaliable ? () => setLocation(path) : undefined}
    >
      <Card className="flex items-center justify-between gap-2" withPadding>
        <Column gap="gap-2">
          <Row gap="gap-2">
            <LargeText bold>{toolName}</LargeText>
            {downgraded && <Badge color="warning">降级</Badge>}
            {unavaliable && <Badge color="danger">不可用</Badge>}
          </Row>
          <Text color="gray" className="text-left">
            {description}
          </Text>
        </Column>
        {!unavaliable && (
          <Icon className="text-3xl" icon="i-mdi-keyboard-arrow-right" />
        )}
      </Card>
    </button>
  );
}
