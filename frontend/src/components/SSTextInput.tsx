import { Signal } from "@preact/signals";
import SSText from "./SSText";

interface Props {
  label: string;
  value: Signal<string>;
  onEnter?(): void;
  noSelectOnFocus?: boolean;
}

export default function SSTextInput({
  label,
  value,
  onEnter,
  noSelectOnFocus = false,
}: Props) {
  return (
    <div>
      <SSText bold>{label}</SSText>
      <input
        type="text"
        className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white p-1.5 px-3 text-gray-900 focus:!border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        value={value.value}
        onChange={(event: any) => (value.value = event.currentTarget.value)}
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
