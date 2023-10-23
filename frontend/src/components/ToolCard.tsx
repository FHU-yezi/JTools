import { Badge, CardButton, Column, Icon, Row, Text } from "@sscreator/ui";
import { AiOutlineRight } from "react-icons/ai";
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
    <CardButton
      onClick={!unavaliable ? () => setLocation(path) : undefined}
      rounded="rounded-lg"
    >
      <Row className="justify-between" verticalCenter>
        <Column className="items-start" gap="gap-2">
          <Row gap="gap-2">
            <Text className="text-left" large bold>
              {toolName}
            </Text>
            {downgraded && (
              <Badge
                backgroundColor="bg-orange-200 dark:bg-orange-950"
                textColor="text-orange-500"
              >
                降级
              </Badge>
            )}
            {unavaliable && (
              <Badge
                backgroundColor="bg-red-200 dark:bg-red-950"
                textColor="text-red-500"
              >
                不可用
              </Badge>
            )}
          </Row>
          <Text className="text-left" gray>
            {description}
          </Text>
        </Column>
        {!unavaliable && (
          <Icon>
            <AiOutlineRight size={24} />
          </Icon>
        )}
      </Row>
    </CardButton>
  );
}
