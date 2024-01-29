import { useDebouncedValue } from "@mantine/hooks";
import type { Signal } from "@preact/signals";
import { useSignal } from "@preact/signals";
import { Text, TextInput } from "@sscreator/ui";
import clsx from "clsx";
import { useEffect, useRef } from "preact/hooks";

interface Props {
  id: string;
  label: string;
  value: Signal<string>;
  description?: string;
  placeholder?: string;
  onEnter?: () => void;
  onValueChange(value: string): void;
  completeItems: Signal<string[]>;
  debounceTime?: number;
  noSelectOnFocus?: boolean;
}

export default function Autocomplete({
  id,
  label,
  value,
  description,
  placeholder,
  onEnter,
  onValueChange,
  completeItems,
  debounceTime = 300,
  noSelectOnFocus = false,
}: Props) {
  const showDropdown = useSignal(false);
  const [debouncedValue] = useDebouncedValue(value.value, debounceTime, {
    leading: true,
  });
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => onValueChange(debouncedValue), [debouncedValue]);

  useEffect(() => {
    if (textInputRef.current !== undefined) {
      textInputRef.current!.onfocus = () => (showDropdown.value = true);
      textInputRef.current!.onblur = () => (showDropdown.value = false);
    }
  }, [textInputRef.current]);

  return (
    <div className="relative">
      <TextInput
        id={id}
        label={label}
        value={value}
        helpText={description}
        placeholder={placeholder}
        onEnter={onEnter}
        selectAllOnFocus={!noSelectOnFocus}
        ref={textInputRef}
      />

      {/* 如果同时满足以下条件，展示下拉菜单：
          补全列表不为空
          输入框不为空
          输入框内容不等于唯一补全结果 */}
      {completeItems.value.length !== 0 &&
        value.value.length !== 0 &&
        value.value !== completeItems.value[0] && (
          <div
            className={clsx(
              "color-layer-2 gray-border absolute left-0 top-full z-10 mt-2 flex w-full flex-col rounded p-2 shadow transition-opacity",
              {
                "opacity-0": !showDropdown.value,
                "opacity-100": showDropdown.value,
              },
            )}
          >
            {completeItems.value.map((item) => (
              <button
                type="button"
                className="w-full rounded p-2 text-left transition-colors hover:bg-zinc-100 hover:font-semibold focus:outline-none dark:hover:bg-zinc-700"
                onClick={() => {
                  textInputRef.current!.value = item;
                  value.value = item;
                }}
              >
                <Text>{item}</Text>
              </button>
            ))}
          </div>
        )}
    </div>
  );
}