import clsx from "clsx";
import { VNode } from "preact";

interface Props {
  children: Element | VNode;
  onClick(): void;
  color?: string;
}

export default function SSActionIcon({
  children,
  onClick,
  color = "hover:bg-gray-100 active:bg-gray-200",
}: Props) {
  return (
    <button
      type="button"
      className={clsx(color, "rounded-md p-2")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
