import { Text, Stack } from "@mantine/core";

interface Props {
    title: string;
    value: string | number;
    desc?: string;
}

export default function SSStat({ title, value, desc = "" }: Props) {
  return (
    <Stack spacing={4}>
      <Text>{title}</Text>
      <Text fz="xl">{value}</Text>
      <Text fz="sm" c="dimmed">{desc}</Text>
    </Stack>
  );
}
