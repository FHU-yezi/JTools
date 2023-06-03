import { Autocomplete, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Signal } from "@preact/signals";
import { useEffect } from "preact/hooks";

interface Props {
  label: string;
  value: Signal<string>;
  onValueChange?: (value: string) => void;
  completeItems: Signal<string[]>;
  debounceTime?: number;
}

export default function JMFAutocomplete({
  label,
  value,
  onValueChange,
  completeItems,
  debounceTime,
}: Props) {
  const [debouncedValue] = useDebouncedValue(value.value, debounceTime ?? 300, {
    leading: true,
  });

  useEffect(() => onValueChange!(debouncedValue), [debouncedValue]);

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
        }}
        data={completeItems.value}
      />
    </div>
  );
}
