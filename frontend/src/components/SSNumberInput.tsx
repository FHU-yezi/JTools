import { NumberInput, Text } from "@mantine/core";
import { Signal } from "@preact/signals";

interface Props {
  label: string;
  value: Signal<number>;
  min?: number;
  max?: number;
  precision?: number;
  onEnter?: () => void;
  noSelectOnFocus?: boolean;
  showControls?: boolean;
}

export default function SSNumberInput({
  label, value, min, max, precision = 0, onEnter, noSelectOnFocus = false, showControls = false,
}: Props) {
  return (
    <div>
      <Text fw={600}>{label}</Text>
      <NumberInput
        mt={6}
        value={value.value}
        min={min}
        max={max}
        precision={precision}
        onChange={(x: number) => (value.value = x)}
        onKeyUp={onEnter ? (event: any) => (event.key === "Enter" && onEnter()) : undefined}
        onFocus={
          !noSelectOnFocus
            ? (event: any) => (
              event.currentTarget.value.length !== 0 && event.currentTarget.select()
            )
            : undefined
      }
        hideControls={!showControls}
        aria-label={label}
      />
    </div>
  );
}
