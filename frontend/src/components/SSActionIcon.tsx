import clsx from "clsx";
import type { ComponentChildren } from "preact";
import SSText from "./SSText";

interface Props {
  className?: string;
  label: string;
  children: ComponentChildren;
  onClick(): void;
}

export default function SSActionIcon({
  className,
  label,
  children,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      className={clsx(
        className,
        "rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
      onClick={onClick}
      aria-label={label}
    >
      <SSText>{children}</SSText>
    </button>
  );
}
