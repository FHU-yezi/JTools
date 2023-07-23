import clsx from "clsx";
import { AiOutlineRight } from "react-icons/ai";
import { useLocation } from "wouter-preact";
import SSBadge from "./SSBadge";
import SSText from "./SSText";

interface Props {
  toolName: string;
  path: string;
  description: string;
  downgraded: boolean;
  unavaliable: boolean;
}

export default function ToolCard({
  toolName,
  path,
  description,
  downgraded,
  unavaliable,
}: Props) {
  const [, setLocation] = useLocation();
  return (
    <button
      type="button"
      className={clsx(
        "gray-border flex w-full items-center justify-between gap-4 rounded-xl bg-white p-5 shadow dark:bg-gray-900",
        {
          "transition-colors hover:bg-gray-100 dark:hover:bg-gray-800":
            !unavaliable,
          "cursor-not-allowed": unavaliable,
        }
      )}
      onClick={!unavaliable ? () => setLocation(path) : undefined}
    >
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <SSText className="font-bold" large>
            {toolName}
          </SSText>
          {downgraded && (
            <SSBadge className="bg-orange-200 text-orange-500 dark:bg-orange-950">
              降级
            </SSBadge>
          )}
          {unavaliable && (
            <SSBadge className="bg-red-200 text-red-500 dark:bg-red-950">
              不可用
            </SSBadge>
          )}
        </div>
        <SSText className="text-left">{description}</SSText>
      </div>
      {!unavaliable && (
        <SSText>
          <AiOutlineRight size={24} />
        </SSText>
      )}
    </button>
  );
}
