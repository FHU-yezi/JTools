import clsx from "clsx";
import { VNode } from "preact";
import SSText from "./SSText";

interface Props {
  className?: string;
  children: Element | VNode;
  onClick(): void;
}

export default function SSActionIcon({ className, children, onClick }: Props) {
  return (
    <button
      type="button"
      className={clsx(
        className,
        "rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
      onClick={onClick}
    >
      <SSText>{children}</SSText>
    </button>
  );
}
