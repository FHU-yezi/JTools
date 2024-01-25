import { Badge, Column, Icon, LargeText, Row, Text } from "@sscreator/ui";
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
    <button
      type="button"
      onClick={!unavaliable ? () => setLocation(path) : undefined}
    >
      <Row className="justify-between" itemsCenter>
        <Column className="items-start" gap="gap-2">
          <Row gap="gap-2">
            <LargeText className="text-left" bold>
              {toolName}
            </LargeText>
            {downgraded && <Badge colorScheme="warning">降级</Badge>}
            {unavaliable && <Badge colorScheme="danger">不可用</Badge>}
          </Row>
          <Text colorScheme="gray" className="text-left">
            {description}
          </Text>
        </Column>
        {!unavaliable && <Icon icon={<AiOutlineRight size={24} />} />}
      </Row>
    </button>
  );
}
