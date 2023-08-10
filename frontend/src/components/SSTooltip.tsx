import clsx from "clsx";
import type { ComponentChildren } from "preact";
import { GoQuestion } from "react-icons/go";
import SSText from "./SSText";

interface Props {
  children: ComponentChildren;
  className?: string;
  tooltip: string;
  hideIcon?: boolean;
}

export default function SSTooltip({
  children,
  className,
  tooltip,
  hideIcon = false,
}: Props) {
  return (
    <div className={clsx(className, "relative")}>
      <button type="button" className="group peer">
        <SSText
          className="flex items-center gap-2 transition-colors group-focus:text-blue-500 group-hover:text-blue-500"
          small
          gray
        >
          {!hideIcon && <GoQuestion size="1.2em" />}
          {children}
        </SSText>
      </button>
      <p
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 mb-1 max-w-sm rounded-md bg-zinc-800 p-2 text-zinc-100 opacity-0 shadow transition-opacity dark:text-zinc-300 peer-focus:opacity-100 peer-hover:opacity-100"
      >
        {tooltip}
      </p>
    </div>
  );
}
