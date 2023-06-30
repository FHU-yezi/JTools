import { Switch, Text, useMantineColorScheme } from "@mantine/core";
import { spotlight } from "@mantine/spotlight";
import { AiOutlineSearch } from "react-icons/ai";
import { BsMoonStars, BsSun } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";
import { useLocation } from "wouter-preact";
import umamiTrack from "../utils/umamiTrack";

interface Props {
  toolName: string;
  showBackArrow: boolean;
}

export default function Header({ toolName, showBackArrow }: Props) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [, setLocation] = useLocation();

  return (
    <>
      <div className="fixed left-0 top-0 z-40 flex h-16 w-full flex-nowrap justify-between bg-zinc-50 px-[5vw] shadow-sm dark:bg-zinc-800">
        <div className="flex flex-nowrap items-center gap-x-2">
          {showBackArrow && (
            <button
              type="button"
              onClick={() => setLocation("/")}
              aria-label="Back"
            >
              <IoIosArrowBack
                className="text-zinc-500 dark:text-zinc-300"
                size={22}
              />
            </button>
          )}
          <Text
            size="lg"
            fw={700}
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "calc(90vw - 150px)",
            }}
          >
            {toolName}
          </Text>
        </div>
        <div className="flex flex-nowrap items-center gap-x-3">
          <button
            type="button"
            onClick={() => {
              umamiTrack("click-search-button");
              spotlight.open();
            }}
            aria-label="Search"
          >
            <AiOutlineSearch
              className="text-zinc-500 dark:text-zinc-300"
              size={22}
            />
          </button>
          <Switch
            size="md"
            color={colorScheme === "dark" ? "gray" : "dark"}
            onLabel={<BsMoonStars size={16} />}
            offLabel={<BsSun size={16} />}
            checked={colorScheme === "dark"}
            onChange={() => {
              toggleColorScheme();
              umamiTrack("toggle-color-scheme");
            }}
            aria-label="Toggle Color Scheme"
          />
        </div>
      </div>
      <div className="h-12" />
    </>
  );
}
