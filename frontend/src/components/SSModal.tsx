/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Signal, useSignal } from "@preact/signals";
import clsx from "clsx";
import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";
import { MdClose } from "react-icons/md";
import SSText from "./SSText";

function closeModalWhenEscPressed(onClose: () => void) {
  return (e: KeyboardEvent) => {
    if (e.code === "Escape") {
      onClose();
    }
  };
}

interface Props {
  children: ComponentChildren;
  isOpen: Signal<boolean>;
  onClose(): void;
  title: string;
  hideCloseButton?: boolean;
  preventCloseByClickMask?: boolean;
  preventCloseByEsc?: boolean;
}

export default function SSModal({
  children,
  isOpen,
  onClose,
  title,
  hideCloseButton = false,
  preventCloseByClickMask = false,
  preventCloseByEsc = false,
}: Props) {
  // 对于每个 Modal，只存储一个事件处理器函数，以便正确清除
  // 该组件假设 preventCloseByEsc 参数不会在运行时修改
  // 因此对于设置 preventCloseByEsc = true 的场景，不存储该函数以节省资源
  const usingEscEventHandlerFunc = useSignal(
    !preventCloseByClickMask ? closeModalWhenEscPressed(onClose) : undefined
  );

  //  Modal 展示时禁止下层元素滚动
  useEffect(() => {
    if (isOpen.value) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "";
    }
  }, [isOpen.value]);

  // 如果没有显式禁止，允许用户通过按下 Esc 关闭 Modal
  useEffect(() => {
    if (!preventCloseByEsc) {
      if (isOpen.value) {
        document.addEventListener("keydown", usingEscEventHandlerFunc.value!);
      } else {
        document.removeEventListener(
          "keydown",
          usingEscEventHandlerFunc.value!
        );
      }
    }
  }, [isOpen.value]);

  return (
    <>
      <div
        className={clsx(
          "fixed left-0 top-0 z-20 h-screen w-screen bg-black opacity-10 transition-opacity duration-200 dark:opacity-50",
          {
            "pointer-events-none !opacity-0": !isOpen.value,
          }
        )}
        onClick={!preventCloseByClickMask ? onClose : undefined}
      />
      <div
        className={clsx(
          "sm:gray-border fixed left-0 top-0 z-30 h-screen w-screen bg-white p-4 transition-all duration-200 dark:bg-gray-900 sm:left-[50vw] sm:top-[10vh] sm:h-fit sm:w-[60vw] sm:min-w-[36rem] sm:max-w-3xl sm:-translate-x-1/2 sm:rounded-lg sm:shadow",
          {
            "pointer-events-none !opacity-0 sm:-translate-y-1/2": !isOpen.value,
          }
        )}
      >
        <div className="flex items-center justify-between p-2">
          <SSText className="leading-none" large bold>
            {title}
          </SSText>
          {!hideCloseButton && (
            <SSText className="transition-colors hover:text-red-500" xlarge>
              <MdClose size={24} onClick={onClose} />
            </SSText>
          )}
        </div>

        {children}
      </div>
    </>
  );
}
