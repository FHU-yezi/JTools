import clsx from "clsx";
import type { ComponentChildren } from "preact";
import { AiOutlineLoading } from "react-icons/ai";

interface Props {
  children: ComponentChildren;
  className?: string;
  onClick?(): void;
  loading?: boolean;
  light?: boolean;
}

export default function SSButton({
  children,
  className,
  onClick,
  loading = false,
  light = false,
}: Props) {
  return (
    <button
      type="button"
      className={clsx(
        className,
        "rounded-lg p-2 transition-colors focus:border-blue-500 focus:outline-none focus:ring",
        {
          "bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-600":
            !light,
          "border border-zinc-500 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800":
            light,
          "cursor-wait": loading,
        }
      )}
      onClick={onClick}
    >
      <p
        className={clsx(
          "flex items-center justify-center gap-3 font-semibold",
          {
            "text-zinc-100": !light,
            "text-zinc-900 dark:text-zinc-300": light,
          }
        )}
      >
        {loading && (
          <AiOutlineLoading className="motion-safe:animate-spin" size={16} />
        )}
        {children}
      </p>
    </button>
  );
}
