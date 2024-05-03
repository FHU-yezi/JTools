import { useComputed, useSignal } from "@preact/signals";
import { Column, LargeText, Modal, TextButton, TextInput } from "@sscreator/ui";
import { tools } from "../routes";
import { removeSpace } from "../utils/textHelper";
import umamiTrack from "../utils/umamiTrack";
import ToolCard from "./ToolCard";

export default function SearchModal() {
  const isSearchModalOpened = useSignal(false);
  const inputContent = useSignal("");
  const matchRouteItems = useComputed(() =>
    inputContent.value !== ""
      ? tools
          .filter((item) =>
            removeSpace(item.pageName).includes(
              removeSpace(inputContent.value),
            ),
          )
          .slice(0, 5)
      : [],
  );

  return (
    <>
      <TextButton
        color="black"
        leftIcon="i-mdi-search"
        onClick={() => {
          isSearchModalOpened.value = true;
          umamiTrack("click-search-button");
        }}
        aria-label="搜索"
      />

      <Modal open={isSearchModalOpened} title="搜索小工具">
        <Column>
          <TextInput
            id="tool-name"
            value={inputContent}
            placeholder="输入工具名称..."
          />

          {!inputContent.value || matchRouteItems.value.length ? (
            matchRouteItems.value.map((item) => (
              // 此处的 ToolCard 不展示小工具降级或不可用状态
              <ToolCard
                key={item.path}
                toolName={item.pageName}
                description={item.description}
                path={item.path}
                downgraded={false}
                unavaliable={false}
              />
            ))
          ) : (
            <LargeText className="text-center">无结果</LargeText>
          )}
        </Column>
      </Modal>
    </>
  );
}
