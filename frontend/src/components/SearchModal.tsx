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

interface ToolItemProps {
  name: string;
  description: string;
  onClick(): void;
}

function ToolItem({ name, description, onClick }: ToolItemProps) {
  return (
    <CardButton rounded="rounded-lg" onClick={onClick}>
      <Column gap="gap-2">
        <Text className="text-left" large bold>
          {name}
        </Text>
        <Text className="text-left" gray>
          {description}
        </Text>
      </Column>
    </CardButton>
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
              <ToolItem
                name={item.toolName}
                description={item.description}
                onClick={() => setLocation(item.path)}
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
