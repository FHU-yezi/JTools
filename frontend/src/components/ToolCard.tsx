import { AiOutlineArrowRight } from "react-icons/ai";
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
      className="flex w-full items-center justify-between rounded-2xl border bg-white p-5 shadow transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
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
        <AiOutlineArrowRight
          className="text-gray-900 dark:text-gray-300"
          size={24}
        />
      )}
    </button>
  );
}
