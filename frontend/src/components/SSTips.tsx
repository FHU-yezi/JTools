import { Text, Tooltip } from "@mantine/core";
import { GoQuestion } from "react-icons/go";

interface Props {
  label: string;
  content: string;
  multiline?: boolean;
  inline?: boolean;
}

export default function SSTips({
  label,
  content,
  multiline = false,
  inline = false,
}: Props) {
  return (
    <Tooltip
      label={content}
      inline={inline}
      position="top-start"
      events={{ hover: true, focus: true, touch: true }}
      multiline={multiline}
      width={multiline ? 256 : undefined}
    >
      <Text fz="sm" c="dimmed">
        <GoQuestion size="1.2em" />
        {"  "}
        {label}
      </Text>
    </Tooltip>
  );
}
