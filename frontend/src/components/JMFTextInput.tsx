import { Text, TextInput } from "@mantine/core";
import { Signal } from "@preact/signals";

interface Props {
  label: string;
  value: Signal<string>;
}

export default function JMFTextInput({ label, value }: Props) {
  return (
    <div>
      <Text fw={600}>{label}</Text>
      <TextInput
        mt={6}
        value={value.value}
        onChange={(event: any) => (value.value = event.currentTarget.value)}
      />
    </div>
  );
}
