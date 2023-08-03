import type { Signal } from "@preact/signals";
import SSText from "./SSText";

interface Props {
  label: string;
  value: Signal<number>;
  description?: string;
  min?: number;
  max?: number;
  step?: string;
  onEnter?: () => void;
  noSelectOnFocus?: boolean;
}

export default function SSNumberInput({
  label,
  value,
  description,
  min,
  max,
  step = "1",
  onEnter,
  noSelectOnFocus = false,
}: Props) {
  return (
    <div>
      <SSText className="mb-1.5" bold>
        {label}
      </SSText>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9\.]*"
        min={min}
        max={max}
        step={step}
        className="w-full border border-zinc-200 rounded-lg bg-white p-1.5 px-3 text-zinc-900 dark:(border-zinc-600 bg-zinc-800 text-zinc-300) focus:!border-blue-500 invalid:!border-red-500"
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
      {description && (
        <SSText className="mt-1.5" gray small>
          {description}
        </SSText>
      )}
    </div>
  );
}
