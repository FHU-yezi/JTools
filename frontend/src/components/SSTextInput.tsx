import type { Signal } from "@preact/signals";
import type { Ref } from "preact";
import SSText from "./SSText";

interface Props {
  label: string;
  value: Signal<string>;
  description?: string;
  placeholder?: string;
  onEnter?(): void;
  noSelectOnFocus?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}

export default function SSTextInput({
  label,
  value,
  description,
  placeholder,
  onEnter,
  noSelectOnFocus = false,
  inputRef,
}: Props) {
  return (
    <div>
      <SSText className="mb-1.5" bold>
        {label}
      </SSText>
      <input
        type="text"
        className="w-full border border-zinc-200 rounded-lg bg-white p-1.5 px-3 text-zinc-900 dark:(border-zinc-600 bg-zinc-800 text-zinc-300) focus:outline-none focus:!border-blue-500"
        value={value.value}
        placeholder={placeholder}
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
        ref={inputRef}
      />
      {description && (
        <SSText className="mt-1.5" gray small>
          {description}
        </SSText>
      )}
    </div>
  );
}
