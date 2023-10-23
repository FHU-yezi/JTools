import { useClipboard } from "@mantine/hooks";
import type { Signal } from "@preact/signals";
import { signal } from "@preact/signals";
import {
  Center,
  Column,
  GhostButton,
  PrimaryButton,
  Row,
  Text,
  TextInput,
} from "@sscreator/ui";
import { MdContentCopy, MdDone, MdOutlineArrowForward } from "react-icons/md";
import QRCode from "react-qr-code";
import { toastWarning } from "../utils/toastHelper";

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
    toastWarning({ message: "输入的不是有效的简书链接，请检查" });
    return;
  }

  hasResult.value = true;
  result.value = jianshuURL.value.replace(
    `https://www.jianshu.com/${urlType.URLPrefix}/`,
    `jianshu://${urlType.URLSchemePrefix}/`,
  );
}

export default function URLSchemeConvertor() {
  const clipboard = useClipboard();

  return (
    <Column>
      <TextInput label="简书链接" value={jianshuURL} onEnter={handleConvert} />
      <PrimaryButton onClick={handleConvert} fullWidth>
        转换
      </PrimaryButton>

      {result.value !== undefined && (
        <Center>
          <Column className="mt-12" gap="gap-4">
            <Row gap="gap-2" verticalCenter>
              <Text>{result.value}</Text>
              <GhostButton
                icon={<MdOutlineArrowForward />}
                onClick={() => window.open(result.value)}
              >
                访问
              </GhostButton>
              <GhostButton
                className={!clipboard.copied ? undefined : "bg-green-100"}
                icon={!clipboard.copied ? <MdContentCopy /> : <MdDone />}
                onClick={() => clipboard.copy(result.value)}
              >
                {!clipboard.copied ? "复制" : "复制成功"}
              </GhostButton>
            </Row>
            <QRCode className="w-full" value={result.value} />
          </Column>
        </Center>
      )}
    </Column>
  );
}
