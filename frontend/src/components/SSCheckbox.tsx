import type { Signal } from "@preact/signals";
import clsx from "clsx";
import { BiCheck } from "react-icons/bi";
import SSCenter from "./SSCenter";
import SSText from "./SSText";

interface Props {
  label: string;
  value: Signal<boolean>;
}

export default function SSCheckbox({ label, value }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      tabIndex={0}
      className="w-fit"
      aria-checked={value.value}
      onClick={() => (value.value = !value.value)}
      onKeyPress={() => (value.value = !value.value)}
    >
      <SSText className="flex select-none items-center gap-2">
        <SSCenter
          className={clsx("h-5 w-5 rounded transition-colors duration-100", {
            "gray-border color-layer-1 hover:bg-gray-100 dark:hover:bg-gray-700":
              !value.value,
            "bg-gray-800 hover:bg-gray-700": value.value,
          })}
        >
          {value.value && (
            <BiCheck className="stroke-gray-100 stroke-2 dark:stroke-gray-300" />
          )}
        </SSCenter>
        {label}
      </SSText>
    </button>
  );
}
