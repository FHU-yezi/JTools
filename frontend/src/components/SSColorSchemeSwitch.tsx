import { useLocalStorage } from "@mantine/hooks";
import clsx from "clsx";
import { BsMoon, BsSun } from "react-icons/bs";
import umamiTrack from "../utils/umamiTrack";
import SSText from "./SSText";

export default function SSColorSchemeSwitch() {
  const [colorScheme, setColorScheme] = useLocalStorage<"light" | "dark">({
    key: "jtools-color-scheme",
    defaultValue: "light",
  });

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");

    // UnoCSS 深色模式
    if (colorScheme === "dark") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  return (
    <div
      role="switch"
      tabIndex={0}
      aria-checked={colorScheme === "dark"}
      className="gray-border flex items-center justify-between overflow-x-hidden rounded-lg"
      onClick={() => {
        toggleColorScheme();
        umamiTrack("toggle-color-scheme");
      }}
      onKeyPress={() => toggleColorScheme()}
      aria-label="切换颜色主题"
    >
      <SSText
        className={clsx("p-2 transition-colors duration-300", {
          "bg-zinc-200": colorScheme === "light",
        })}
      >
        <BsSun size={14} />
      </SSText>
      <SSText
        className={clsx("p-2 transition-colors duration-300", {
          "bg-zinc-600": colorScheme === "dark",
        })}
      >
        <BsMoon size={14} />
      </SSText>
    </div>
  );
}
