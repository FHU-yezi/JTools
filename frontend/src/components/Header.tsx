import { IoIosArrowBack } from "react-icons/io";
import { useLocation } from "wouter-preact";
import SSActionIcon from "./SSActionIcon";
import SSAvatar from "./SSAvatar";
import SSColorSchemeSwitch from "./SSColorSchemeSwitch";
import SSText from "./SSText";
import SearchModal from "./SearchModal";
import Icon from "/favicon-64.png";

interface Props {
  toolName: string;
  showIcon?: boolean;
  hideBackArrow?: boolean;
}

export default function Header({
  toolName,
  showIcon = false,
  hideBackArrow = false,
}: Props) {
  const [, setLocation] = useLocation();

  return (
    <>
      <div className="color-layer-2 fixed left-0 top-0 z-10 h-16 w-full flex flex-nowrap items-center justify-between px-[5vw] shadow-sm">
        <div className="flex flex-nowrap items-center gap-x-2">
          {showIcon && (
            <SSAvatar className="h-10 w-10 dark:bg-zinc-300" src={Icon} />
          )}
          {!hideBackArrow && (
            <SSActionIcon
              className="!p-1"
              onClick={() => setLocation("/")}
              label="返回"
            >
              <IoIosArrowBack
                className="text-zinc-500 dark:text-zinc-300"
                size={22}
              />
            </SSActionIcon>
          )}
          <SSText
            className="max-w-[50vw] overflow-x-hidden text-ellipsis whitespace-nowrap font-bold"
            large
          >
            {toolName}
          </SSText>
        </div>
        <div className="flex flex-nowrap items-center gap-x-3">
          <SearchModal />
          <SSColorSchemeSwitch />
        </div>
      </div>
      <div className="h-12" />
    </>
  );
}
