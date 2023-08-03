import { IoIosArrowBack } from "react-icons/io";
import { useLocation } from "wouter-preact";
import SSColorSchemeSwitch from "./SSColorSchemeSwitch";
import SSText from "./SSText";
import SearchModal from "./SearchModal";

interface Props {
  toolName: string;
  showBackArrow: boolean;
}

export default function Header({ toolName, showBackArrow }: Props) {
  const [, setLocation] = useLocation();

  return (
    <>
      <div className="color-layer-2 fixed left-0 top-0 z-10 h-16 w-full flex flex-nowrap items-center justify-between px-[5vw] shadow-sm">
        <div className="flex flex-nowrap items-center gap-x-2">
          {showBackArrow && (
            <button
              type="button"
              onClick={() => setLocation("/")}
              aria-label="返回"
            >
              <IoIosArrowBack
                className="text-zinc-500 dark:text-zinc-300"
                size={22}
              />
            </button>
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
