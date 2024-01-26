import { useClipboard } from "@mantine/hooks";
import { signal } from "@preact/signals";
import {
  Center,
  Column,
  Row,
  SmallText,
  SolidButton,
  Text,
  TextButton,
  TextInput,
} from "@sscreator/ui";
import { MdContentCopy, MdDone, MdOutlineArrowForward } from "react-icons/md";
import QRCode from "react-qr-code";
import { toastWarning } from "../utils/toastHelper";

interface UrlMappingItem {
  name: string;
  from: RegExp;
  to: string;
}

const UrlMappingArray: Array<UrlMappingItem> = [
  {
    name: "user",
    from: /^https:\/\/www\.jianshu\.com\/u\/([a-z0-9]{6,12})\/?$/,
    to: "jianshu://u/$1",
  },
  {
    name: "article",
    from: /^https:\/\/www\.jianshu\.com\/p\/([a-z0-9]{12})\/?$/,
    to: "jianshu://p/$1",
  },
  {
    name: "notebook",
    from: /^https:\/\/www\.jianshu\.com\/nb\/(\d{7,8})\/?$/,
    to: "jianshu://nb/$1",
  },
  {
    name: "collection",
    from: /^https:\/\/www\.jianshu\.com\/c\/([a-z0-9]{6,12})\/?$/,
    to: "jianshu://c/$1",
  },
];

const inputUrl = signal("");
const urlScheme = signal<string | null>(null);

function isJianshuUrl(url: string) {
  return url.startsWith("https://www.jianshu.com/");
}

function handleConvert() {
  if (!isJianshuUrl(inputUrl.value)) {
    toastWarning({ message: "请输入有效的简书链接" });
    return;
  }

  for (const urlMapping of UrlMappingArray) {
    const replaceResult = inputUrl.value.replace(
      urlMapping.from,
      urlMapping.to,
    );

    // 匹配成功
    if (replaceResult.startsWith("jianshu://")) {
      urlScheme.value = replaceResult;
      return;
    }
  }

  // 无匹配项
  toastWarning({ message: "请输入有效的简书链接" });
}

function Result() {
  const clipboard = useClipboard();

  if (!urlScheme.value) {
    return null;
  }

  return (
    <Center>
      <Column className="mt-12" gap="gap-2" itemsCenter>
        <Text>{urlScheme.value}</Text>
        <Row itemsCenter>
          <TextButton
            rightIcon={<MdOutlineArrowForward />}
            onClick={() => window.open(urlScheme.value!)}
          >
            访问
          </TextButton>
          <TextButton
            colorScheme={clipboard.copied ? "success" : undefined}
            rightIcon={clipboard.copied ? <MdDone /> : <MdContentCopy />}
            onClick={() => clipboard.copy(urlScheme.value)}
          >
            {clipboard.copied ? "已复制" : "复制"}
          </TextButton>
        </Row>

        <Center className="rounded p-2 dark:bg-zinc-50">
          <QRCode value={urlScheme.value} />
        </Center>
        <SmallText className="text-center" colorScheme="gray">
          请使用简书 App 扫描二维码
        </SmallText>
      </Column>
    </Center>
  );
}

export default function URLSchemeConvertor() {
  return (
    <Column>
      <TextInput
        id="jianshu-url"
        label="简书链接"
        value={inputUrl}
        onEnter={handleConvert}
        errorMessage={
          inputUrl.value && !isJianshuUrl(inputUrl.value)
            ? "链接无效"
            : undefined
        }
        selectAllOnFocus
      />
      <SolidButton onClick={handleConvert} fullWidth>
        转换
      </SolidButton>

      {urlScheme.value && <Result />}
    </Column>
  );
}
