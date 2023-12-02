import { useComputed, useSignal } from "@preact/signals";
import {
  CardButton,
  Column,
  GhostButton,
  Modal,
  NoResultNotice,
  Text,
  TextInput,
} from "@sscreator/ui";
import { useEffect, useRef } from "preact/hooks";
import { MdSearch } from "react-icons/md";
import { useLocation } from "wouter-preact";
import { routes } from "../routes";
import { removeSpace } from "../utils/textHelper";
import umamiTrack from "../utils/umamiTrack";
import ToolCard from "./ToolCard";

export default function SearchModal() {
  const searchModalOpen = useSignal(false);
  const textInputContent = useSignal("");
  const matchRouteItems = useComputed(() =>
    textInputContent.value === ""
      ? routes
      : routes.filter((item) =>
          removeSpace(item.toolName).includes(
            removeSpace(textInputContent.value),
          ),
        ),
  );
  const textInputRef = useRef<HTMLInputElement>(null);

  // Modal 展开时聚焦到搜索框
  useEffect(
    () => (searchModalOpen.value ? textInputRef.current?.focus() : undefined),
    [searchModalOpen.value],
  );

  return (
    <>
      <GhostButton
        icon={
          <MdSearch className="text-zinc-500 dark:text-zinc-300" size={22} />
        }
        hoverBackgroundColor="hover:bg-zinc-200 dark:hover:bg-zinc-700"
        onClick={() => {
          searchModalOpen.value = true;
          umamiTrack("click-search-button");
        }}
        ariaLabel="搜索"
      />

      <Modal open={searchModalOpen} title="搜索">
        <Column>
          <TextInput
            label=""
            value={textInputContent}
            placeholder="输入工具名称..."
            inputRef={textInputRef}
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
            <NoResultNotice />
          )}
        </Column>
      </Modal>
    </>
  );
}
