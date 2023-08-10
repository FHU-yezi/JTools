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
            className={clsx("transition-transform duration-200", {
              "-rotate-180": isOpened.value,
            })}
            size={14}
          />
        </SSText>
      </div>

      <div
        className={clsx(
          "overflow-y-hidden transition-all transition-ease-linear duration-200 px-4",
          {
            "h-fit py-2 pb-4": isOpened.value,
            "h-0": !isOpened.value,
          },
        )}
      >
        {children}
      </div>
    </div>
  );
}
