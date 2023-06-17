import { Text, TextInput } from "@mantine/core";
import { Signal } from "@preact/signals";

interface Props {
  label: string;
  value: Signal<string>;
  onEnter?: () => void;
  noSelectOnFocus?: boolean;
}

export default function SSTextInput({
  label, value, onEnter, noSelectOnFocus = false,
}: Props) {
  return (
    <div>
      <Text fw={600}>{label}</Text>
      <TextInput
        mt={6}
        value={value.value}
        onChange={(event: any) => (value.value = event.currentTarget.value)}
        onKeyUp={onEnter ? (event: any) => (event.key === "Enter" && onEnter()) : undefined}
        onFocus={
          !noSelectOnFocus
            ? (event: any) => (
              event.currentTarget.value.length !== 0 && event.currentTarget.select()
            )
            : undefined
      }
        aria-label={label}
      />
    </div>
  );
}
