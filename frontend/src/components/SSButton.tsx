import clsx from "clsx";
import { VNode } from "preact";
import { AiOutlineLoading } from "react-icons/ai";

interface Props {
  children: string | number | (string | number | Element | VNode)[];
  className?: string;
  onClick?: () => void;
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
          "bg-gray-900 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600":
            !light,
          "border border-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800":
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
            "text-gray-100": !light,
            "text-gray-900 dark:text-gray-300": light,
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
