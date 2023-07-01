import { Signal } from "@preact/signals";
import SSText from "./SSText";

interface Props {
  label: string;
  value: Signal<number>;
  min?: number;
  max?: number;
  step?: string;
  onEnter?: () => void;
  noSelectOnFocus?: boolean;
}

export default function SSNumberInput({
  label,
  value,
  min,
  max,
  step = "1",
  onEnter,
  noSelectOnFocus = false,
}: Props) {
  return (
    <div>
      <SSText bold>{label}</SSText>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9\.]*"
        min={min}
        max={max}
        step={step}
        className="mt-1.5 w-full rounded-lg border-2 border-zinc-200 bg-white p-1.5 px-3 text-zinc-900 invalid:border-red-500 focus:border-blue-300 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 focus:dark:border-blue-600"
        value={value.value}
        onChange={(event: any) => {
          const parseResult = parseFloat(event.currentTarget.value);
          if (!Number.isNaN(parseResult)) {
            value.value = parseResult;
          }
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
        aria-label={label}
        spellCheck={false}
      />
    </div>
  );
}
