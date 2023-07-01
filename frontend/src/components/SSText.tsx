import clsx from "clsx";
import { VNode } from "preact";

interface Props {
  children: string | number | boolean | (string | number | Element | VNode)[];
  className?: string;
  gray?: boolean;
  color?: string;
  bold?: boolean;
  small?: boolean;
  large?: boolean;
  center?: boolean;
}

export default function SSText({
  children,
  className = "",
  gray = false,
  color = "",
  bold = false,
  small = false,
  large = false,
  center = false,
}: Props) {
  return (
    <p
      className={clsx(className, {
        "text-zinc-900 dark:text-zinc-300": !gray && color.length === 0,
        [color]: color.length !== 0,
        "text-zinc-500": gray,
        "font-semibold": bold,
        "text-sm": small,
        "text-lg": large,
        "text-center": center,
      })}
    >
      {children}
    </p>
  );
}
