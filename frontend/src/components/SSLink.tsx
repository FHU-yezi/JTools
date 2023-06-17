import { Button } from "@mantine/core";

interface Props {
    url: string
    label?: string
    isExternal: boolean
}

export default function SSLink({ url, label, isExternal }: Props) {
  return (
    <Button
      onClick={() => window.open(url, isExternal ? "_blank" : "_self")}
      variant="subtle"
      compact
    >
      {label ?? url}
    </Button>
  );
}
