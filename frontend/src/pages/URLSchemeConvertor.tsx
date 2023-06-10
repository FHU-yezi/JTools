import {
  ActionIcon,
  Button,
  Center,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Signal, signal } from "@preact/signals";
import { AiOutlineCheck } from "react-icons/ai";
import { BiCopy, BiRightArrowAlt } from "react-icons/bi";
import QRCode from "react-qr-code";
import JMFTextInput from "../components/JMFTextInput";

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
const result = signal("");

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
    [,,, perfix, slug] = splitted;
  } catch {
    return "unknown";
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const URLType of URLTypesArray) {
    if (perfix === URLType.URLPrefix) {
      if (
        URLType.slugLengthRange.min <= slug.length
        && slug.length <= URLType.slugLengthRange.max
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
    `jianshu://${urlType.URLSchemePrefix}/`,
  );
}

export default function URLSchemeConvertor() {
  const clipboard = useClipboard();

  return (
    <Stack>
      <JMFTextInput label="简书链接" value={jianshuURL} onEnter={handleConvert} />
      <Button onClick={handleConvert}>转换</Button>
      {hasResult.value && (
        <Center>
          <Stack mt={48} align="center">
            <Group spacing="xs">
              <Text>{result.value}</Text>
              <Tooltip label="访问">
                <ActionIcon onClick={() => window.open(result.value)}>
                  <BiRightArrowAlt />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={!clipboard.copied ? "复制" : "复制成功"}>
                <ActionIcon
                  onClick={() => clipboard.copy(result.value)}
                  color={!clipboard.copied ? undefined : "green"}
                >
                  {!clipboard.copied ? <BiCopy /> : <AiOutlineCheck />}
                </ActionIcon>
              </Tooltip>
            </Group>
            <QRCode value={result.value} />
          </Stack>
        </Center>
      )}
    </Stack>
  );
}
