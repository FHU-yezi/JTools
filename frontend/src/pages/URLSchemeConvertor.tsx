import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Signal, signal } from "@preact/signals";
import { AiOutlineCheck } from "react-icons/ai";
import { BiCopy, BiRightArrowAlt } from "react-icons/bi";
import QRCode from "react-qr-code";
import SSActionIcon from "../components/SSActionIcon";
import SSButton from "../components/SSButton";
import SSText from "../components/SSText";
import SSTextInput from "../components/SSTextInput";
import SSTooltip from "../components/SSTooltip";

interface JianshuURLType {
  URLSchemePrefix: string;
  URLPrefix: string;
  slugLengthRange: { min: number; max: number };
}

const URLTypes = {
  USER: {
    URLSchemePrefix: "u",
    URLPrefix: "u",
    slugLengthRange: { min: 6, max: 12 },
  },
  ARTICLE: {
    URLSchemePrefix: "notes",
    URLPrefix: "p",
    slugLengthRange: { min: 12, max: 12 },
  },
  COLLECTION: {
    URLSchemePrefix: "c",
    URLPrefix: "c",
    slugLengthRange: { min: 6, max: 12 },
  },
  NOTEBOOK: {
    URLSchemePrefix: "nb",
    URLPrefix: "nb",
    slugLengthRange: { min: 7, max: 8 },
  },
};
const URLTypesArray = [
  URLTypes.USER,
  URLTypes.ARTICLE,
  URLTypes.COLLECTION,
  URLTypes.NOTEBOOK,
];

const jianshuURL = signal("");
const hasResult = signal(false);
const result = signal<string | undefined>(undefined);

function isJianshuURL(url: Signal<string>) {
  return url.value.startsWith("https://www.jianshu.com/");
}

function getURLType(url: Signal<string>): JianshuURLType | "unknown" {
  if (!isJianshuURL(url)) {
    return "unknown";
  }

  let splitted;
  let perfix;
  let slug;
  try {
    splitted = url.value.split("/");
    [, , , perfix, slug] = splitted;
  } catch {
    return "unknown";
  }
  for (const URLType of URLTypesArray) {
    if (perfix === URLType.URLPrefix) {
      if (
        URLType.slugLengthRange.min <= slug.length &&
        slug.length <= URLType.slugLengthRange.max
      ) {
        return URLType;
      }
      return "unknown";
    }
  }
  return "unknown";
}

function handleConvert() {
  const urlType = getURLType(jianshuURL);

  if (urlType === "unknown") {
    notifications.show({
      message: "输入的不是有效的简书链接，请检查",
      color: "orange",
    });
    return;
  }

  hasResult.value = true;
  result.value = jianshuURL.value.replace(
    `https://www.jianshu.com/${urlType.URLPrefix}/`,
    `jianshu://${urlType.URLSchemePrefix}/`
  );
}

export default function URLSchemeConvertor() {
  const clipboard = useClipboard();

  return (
    <div className="flex flex-col gap-4">
      <SSTextInput
        label="简书链接"
        value={jianshuURL}
        onEnter={handleConvert}
      />
      <SSButton onClick={handleConvert}>转换</SSButton>

      {typeof result.value !== "undefined" && (
        <div className="grid place-content-center">
          <div className="mt-12 flex flex-col gap-4">
            <div className="flex gap-2">
              <SSText>{result.value}</SSText>
              <SSTooltip tooltip="访问" hideIcon>
                <SSActionIcon onClick={() => window.open(result.value)}>
                  <BiRightArrowAlt />
                </SSActionIcon>
              </SSTooltip>
              <SSTooltip
                tooltip={!clipboard.copied ? "复制" : "复制成功"}
                hideIcon
              >
                <SSActionIcon
                  onClick={() => clipboard.copy(result.value)}
                  color={!clipboard.copied ? undefined : "bg-green-100"}
                >
                  {!clipboard.copied ? <BiCopy /> : <AiOutlineCheck />}
                </SSActionIcon>
              </SSTooltip>
            </div>
            <QRCode value={result.value} />
          </div>
        </div>
      )}
    </div>
  );
}
