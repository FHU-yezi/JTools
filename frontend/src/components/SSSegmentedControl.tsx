import type { Signal } from "@preact/signals";
import clsx from "clsx";
import SSText from "./SSText";

interface Props<T> {
  label?: string;
  data: Record<string, T>;
  value: Signal<T>;
}

export default function SSSegmentedControl<T>({
  label = "",
  data,
  value,
}: Props<T>) {
  return (
    <div>
      <SSText className="mb-1.5" bold>
        {label}
      </SSText>
      <div className="flex overflow-x-auto">
        {Object.entries(data).map(([name, itemValue]) => (
          <div
            role="radio"
            tabIndex={0}
            aria-checked={value.value === itemValue}
            className={clsx(
              "gray-border grid select-none flex-grow place-content-center p-2 transition-colors first:rounded-l-md last:rounded-r-md",
              {
                "bg-zinc-100 dark:bg-zinc-900": value.value !== itemValue,
                "bg-white dark:bg-zinc-700": value.value === itemValue,
              },
            )}
            onClick={() => (value.value = itemValue)}
            onKeyPress={() => (value.value = itemValue)}
          >
            <SSText
              className="whitespace-nowrap"
              gray={value.value !== itemValue}
            >
              {name}
            </SSText>
          </div>
        ))}
      </div>
    </div>
  );
}
