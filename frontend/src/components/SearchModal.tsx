import { useComputed, useSignal } from "@preact/signals";
import { Column, LargeText, Modal, TextButton, TextInput } from "@sscreator/ui";
import { useEffect, useRef } from "preact/hooks";
import { MdSearch } from "react-icons/md";
import { routes } from "../routes";
import { removeSpace } from "../utils/textHelper";
import umamiTrack from "../utils/umamiTrack";
import ToolCard from "./ToolCard";

export default function SearchModal() {
  const searchModalOpen = useSignal(false);
  const textInputContent = useSignal("");
  const matchRouteItems = useComputed(() =>
    textInputContent.value === ""
      ? routes.slice(0, 5)
      : routes
          .filter((item) =>
            removeSpace(item.toolName).includes(
              removeSpace(textInputContent.value),
            ),
          )
          .slice(0, 5),
  );
  const textInputRef = useRef<HTMLInputElement>(null);

  // Modal 展开时聚焦到搜索框
  useEffect(
    () => (searchModalOpen.value ? textInputRef.current?.focus() : undefined),
    [searchModalOpen.value],
  );

  return (
    <>
      <TextButton
        leftIcon={
          <MdSearch className="text-zinc-950 dark:text-zinc-50" size={24} />
        }
        onClick={() => {
          searchModalOpen.value = true;
          umamiTrack("click-search-button");
        }}
        aria-label="搜索"
      />

      <Modal open={searchModalOpen} title="搜索">
        <Column>
          <TextInput
            id="tool-name"
            value={textInputContent}
            placeholder="输入工具名称..."
            ref={textInputRef}
          />

          {matchRouteItems.value.length !== 0 ? (
            matchRouteItems.value.map((item) => (
              // 此处的 ToolCard 不展示小工具降级或不可用状态
              <ToolCard
                toolName={item.toolName}
                description={item.description}
                path={item.path}
                downgraded={false}
                unavaliable={false}
              />
            ))
          ) : (
            <LargeText>无结果</LargeText>
          )}
        </Column>
      </Modal>
    </>
  );
}
