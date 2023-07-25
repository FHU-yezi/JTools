import { useSignal } from "@preact/signals";
import clsx from "clsx";
import type { ComponentChildren } from "preact";
import { BsChevronUp } from "react-icons/bs";
import SSText from "./SSText";

interface Props {
  children: ComponentChildren;
  title: string;
}

export default function SSAccordion({ children, title }: Props) {
  const isOpened = useSignal(false);

  return (
    <div className="gray-border rounded-lg">
      <div
        role="button"
        tabIndex={0}
        className="hover:color-layer-2 flex items-center justify-between px-4 py-3 transition-colors"
        onClick={() => (isOpened.value = !isOpened.value)}
        onKeyPress={() => (isOpened.value = !isOpened.value)}
      >
        <SSText large bold>
          {title}
        </SSText>
        <SSText>
          <BsChevronUp
            className={clsx("transition-transform duration-500", {
              "-rotate-180": isOpened.value,
            })}
            size={14}
          />
        </SSText>
      </div>

      <div
        className={clsx("overflow-y-hidden", {
          "h-fit p-4 pt-2": isOpened.value,
          "h-0": !isOpened.value,
        })}
      >
        {children}
      </div>
    </div>
  );
}
