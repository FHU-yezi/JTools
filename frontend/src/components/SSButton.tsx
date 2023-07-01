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
        "rounded-lg p-2 transition-colors focus:ring",
        {
          "bg-blue-600 hover:bg-blue-700 active:bg-blue-800": !light,
          "border border-blue-500 hover:bg-blue-300 active:bg-blue-500 dark:border-2 dark:border-blue-600 dark:hover:bg-blue-800 dark:active:bg-blue-900":
            light,
        }
      )}
      onClick={onClick}
    >
      <p
        className={clsx(
          "flex items-center justify-center gap-3 font-semibold",
          {
            "text-gray-200": !light,
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
