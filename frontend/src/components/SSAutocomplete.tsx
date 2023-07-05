import { Autocomplete } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import SSText from "./SSText";

interface Props {
  label: string;
  value: Signal<string>;
  onEnter?: () => void;
  onValueChange(value: string): void;
  completeItems: Signal<string[]>;
  debounceTime?: number;
  noSelectOnFocus?: boolean;
}

export default function SSAutocomplete({
  label,
  value,
  onEnter,
  onValueChange,
  completeItems,
  debounceTime = 300,
  noSelectOnFocus = false,
}: Props) {
  const [debouncedValue] = useDebouncedValue(value.value, debounceTime, {
    leading: true,
  });

  useEffect(() => onValueChange(debouncedValue), [debouncedValue]);

  return (
    <div>
      <SSText bold>{label}</SSText>
      <Autocomplete
        mt={6}
        value={value.value}
        onChange={(newValue: string) => {
          value.value = newValue;
        }}
        onKeyUp={
          onEnter
            ? (event: any) => event.key === "Enter" && onEnter()
            : undefined
        }
        onFocus={
          !noSelectOnFocus
            ? (event: any) =>
                event.currentTarget.value.length !== 0 &&
                event.currentTarget.select()
            : undefined
        }
        data={completeItems.value}
        aria-label={label}
        spellcheck={false}
      />
    </div>
  );
}
