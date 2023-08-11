import { BsMoon, BsSun } from "react-icons/bs";
import { useColorScheme } from "../utils/colorSchemeHelper";
import { whenEnterOrSpace } from "../utils/keyHelper";
import umamiTrack from "../utils/umamiTrack";
import SSText from "./SSText";

export default function SSColorSchemeSwitch() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

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
      onKeyUp={(event) =>
        whenEnterOrSpace(event, () => {
          toggleColorScheme();
          umamiTrack("toggle-color-scheme");
        })
      }
      aria-label="切换颜色主题"
    >
      <SSText className="p-2 transition-colors light:bg-zinc-200">
        <BsSun size={14} />
      </SSText>
      <SSText className="p-2 transition-colors dark:bg-zinc-600">
        <BsMoon size={14} />
      </SSText>
    </div>
  );
}
