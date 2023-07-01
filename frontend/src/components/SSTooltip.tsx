import clsx from "clsx";
import { VNode } from "preact";
import { GoQuestion } from "react-icons/go";
import SSText from "./SSText";

interface Props {
  children:
    | string
    | number
    | boolean
    | Element
    | (string | number | boolean | Element | VNode)[];
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
          className="flex items-center gap-2 transition-colors group-hover:text-blue-500 group-focus:text-blue-500"
          small
          gray
        >
          {!hideIcon && <GoQuestion size="1.2em" />}
          {children}
        </SSText>
      </button>
      <p
        role="tooltip"
        className="pointer-events-none absolute bottom-0 max-w-xs -translate-y-1/2 rounded-md bg-gray-800 p-2 text-gray-300 opacity-0 shadow transition-opacity group-hover:opacity-100 peer-hover:opacity-100 peer-focus:opacity-100 dark:bg-gray-800"
      >
        {tooltip}
      </p>
    </div>
  );
}
