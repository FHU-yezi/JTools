import { spotlight } from "@mantine/spotlight";
import { AiOutlineSearch } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";
import { useLocation } from "wouter-preact";
import umamiTrack from "../utils/umamiTrack";
import SSColorSchemeSwitch from "./SSColorSchemeSwitch";
import SSText from "./SSText";

interface Props {
  toolName: string;
  showBackArrow: boolean;
}

export default function Header({ toolName, showBackArrow }: Props) {
  const [, setLocation] = useLocation();

  return (
    <>
      <div className="fixed left-0 top-0 z-40 flex h-16 w-full flex-nowrap justify-between bg-gray-50 px-[5vw] shadow-sm dark:bg-gray-800">
        <div className="flex flex-nowrap items-center gap-x-2">
          {showBackArrow && (
            <button
              type="button"
              onClick={() => setLocation("/")}
              aria-label="Back"
            >
              <IoIosArrowBack
                className="text-gray-500 dark:text-gray-300"
                size={22}
              />
            </button>
          )}
          <SSText
            className="max-w-[calc(90vw - 150px)] overflow-hidden text-ellipsis whitespace-nowrap font-bold"
            large
          >
            {toolName}
          </SSText>
        </div>
        <div className="flex flex-nowrap items-center gap-x-4">
          <button
            type="button"
            onClick={() => {
              umamiTrack("click-search-button");
              spotlight.open();
            }}
            aria-label="Search"
          >
            <AiOutlineSearch
              className="text-gray-500 dark:text-gray-300"
              size={22}
            />
          </button>
          <SSColorSchemeSwitch />
        </div>
      </div>
      <div className="h-12" />
    </>
  );
}
