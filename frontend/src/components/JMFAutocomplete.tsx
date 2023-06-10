import { Autocomplete, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Signal } from "@preact/signals";
import { useEffect } from "preact/hooks";

interface Props {
  label: string;
  value: Signal<string>;
  // eslint-disable-next-line no-unused-vars
  onValueChange: (value: string) => void;
  completeItems: Signal<string[]>;
  debounceTime?: number;
}

export default function JMFAutocomplete({
  label,
  value,
  onValueChange,
  completeItems,
  debounceTime = 300,
}: Props) {
  const [debouncedValue] = useDebouncedValue(value.value, debounceTime, {
    leading: true,
  });

  useEffect(() => onValueChange(debouncedValue), [debouncedValue]);

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
        aria-label={label}
      />
    </div>
  );
}
