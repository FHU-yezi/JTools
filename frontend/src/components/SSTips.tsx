import { Tooltip } from "@mantine/core";
import { GoQuestion } from "react-icons/go";
import SSText from "./SSText";

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
      <SSText small gray>
        <GoQuestion size="1.2em" />
        {"  "}
        {label}
      </SSText>
    </Tooltip>
  );
}
