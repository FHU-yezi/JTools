import clsx from "clsx";
import { VNode } from "preact";

interface Props {
  children:
    | string
    | number
    | boolean
    | Element
    | (string | number | boolean | Element | VNode)[];
  className?: string;
  gray?: boolean;
  color?: string;
  bold?: boolean;
  xbold?: boolean;
  small?: boolean;
  large?: boolean;
  xlarge?: boolean;
  center?: boolean;
}

export default function SSText({
  children,
  className = "",
  gray = false,
  color = "",
  bold = false,
  xbold = false,
  small = false,
  large = false,
  xlarge = false,
  center = false,
}: Props) {
  return (
    <p
      className={clsx(className, {
        "text-gray-900 dark:text-gray-300": !gray && color.length === 0,
        [color]: color.length !== 0,
        "text-gray-500": gray,
        "font-semibold": bold,
        "font-bold": xbold,
        "text-sm": small,
        "text-lg": large,
        "text-xl": xlarge,
        "text-center": center,
      })}
    >
      {children}
    </p>
  );
}
