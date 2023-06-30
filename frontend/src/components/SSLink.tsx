import { Anchor } from "@mantine/core";

interface Props {
  url: string;
  label?: string;
  isExternal?: boolean;
}

export default function SSLink({ url, label, isExternal = false }: Props) {
  return (
    <Anchor href={url} target={isExternal ? "_blank" : "_self"}>
      {label ?? url}
    </Anchor>
  );
}
