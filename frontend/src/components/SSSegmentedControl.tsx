import { Signal } from "@preact/signals";
import clsx from "clsx";
import SSText from "./SSText";

interface Props<T> {
  label: string;
  data: Record<string, T>;
  value: Signal<T>;
}

export default function SSSegmentedControl<T>({
  label,
  data,
  value,
}: Props<T>) {
  return (
    <div className="">
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
              "gray-border grid min-w-fit select-none place-content-center py-2 pl-3 pr-2 transition-colors duration-100 first:rounded-l-lg last:rounded-r-lg",
              {
                "bg-gray-100 dark:bg-gray-900": value.value !== itemValue,
                "bg-white dark:bg-gray-200": value.value === itemValue,
              }
            )}
            onClick={() => (value.value = itemValue)}
            onKeyPress={() => (value.value = itemValue)}
          >
            <SSText
              className={clsx("whitespace-nowrap", {
                "dark:text-black": value.value === itemValue,
              })}
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
