import { useComputed, useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { AiOutlineSearch } from "react-icons/ai";
import { useLocation } from "wouter-preact";
import { routes } from "../routes";
import { removeSpace } from "../utils/textHelper";
import umamiTrack from "../utils/umamiTrack";
import SSActionIcon from "./SSActionIcon";
import SSModal from "./SSModal";
import SSText from "./SSText";
import SSTextInput from "./SSTextInput";

interface ToolItemProps {
  name: string;
  description: string;
  onClick(): void;
}

function ToolItem({ name, description, onClick }: ToolItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="w-full flex flex-col gap-1 rounded-lg p-2 hover:(bg-zinc-100 dark:bg-zinc-800)"
      onClick={onClick}
      onKeyPress={onClick}
    >
      <SSText large bold>
        {name}
      </SSText>
      <SSText gray>{description}</SSText>
    </div>
  );
}

export default function SearchModal() {
  const [, setLocation] = useLocation();

  const searchModalOpen = useSignal(false);
  const textInputContent = useSignal("");
  const matchRouteItems = useComputed(() =>
    textInputContent.value === ""
      ? routes
      : routes.filter((item) =>
          removeSpace(item.toolName).includes(
            removeSpace(textInputContent.value)
          )
        )
  );
  const textInputRef = useRef<HTMLInputElement>(null);

  // Modal 展开时聚焦到搜索框
  useEffect(
    () => (searchModalOpen.value ? textInputRef.current?.focus() : undefined),
    [searchModalOpen.value]
  );

  return (
    <>
      <SSActionIcon
        className="dark:hover:!bg-zinc-700"
        label="搜索"
        onClick={() => {
          searchModalOpen.value = true;
          umamiTrack("click-search-button");
        }}
      >
        <AiOutlineSearch
          className="text-zinc-500 dark:text-zinc-300"
          size={22}
        />
      </SSActionIcon>

      <SSModal
        isOpen={searchModalOpen}
        onClose={() => (searchModalOpen.value = false)}
        title="搜索"
      >
        <div className="h-2" />
        <SSTextInput
          label=""
          value={textInputContent}
          placeholder="输入工具名称..."
          inputRef={textInputRef}
        />

        <div className="mt-3 flex flex-col">
          {matchRouteItems.value.length !== 0 ? (
            matchRouteItems.value.map((item) => (
              <ToolItem
                name={item.toolName}
                description={item.description}
                onClick={() => setLocation(item.path)}
              />
            ))
          ) : (
            <SSText className="m-6" bold large center>
              没有查询到数据
            </SSText>
          )}
        </div>
      </SSModal>
    </>
  );
}
