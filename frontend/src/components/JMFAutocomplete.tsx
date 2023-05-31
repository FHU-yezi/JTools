import { Autocomplete, Text } from "@mantine/core";
import { Signal } from "@preact/signals";

interface Props {
  label: string;
  value: Signal<string>;
  onValueChange?: (value: string) => void;
  completeItems: Signal<string[]>;
}

export default function JMFAutocomplete({
  label,
  value,
  onValueChange,
  completeItems,
}: Props) {
  if (typeof onValueChange === undefined) {
    onValueChange = () => {};
  }
  return (
    <div>
      <Text fw={600}>{label}</Text>
      <Autocomplete
        mt={6}
        value={value.value}
        onChange={(newValue: string) => {
          value.value = newValue;
          onValueChange!(newValue);
        }}
        data={completeItems.value}
      />
    </div>
  );
}
