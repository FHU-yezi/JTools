import {
  Center,
  Column,
  Heading1,
  Icon,
  SolidButton,
  Text,
} from "@sscreator/ui";
import { VscBracketError } from "react-icons/vsc";

export default function V2UnavaliablePage() {
  return (
    <Center className="mx-auto h-screen">
      <Column className="max-w-2xl w-[80vw]">
        <Column gap="gap-2">
          <Icon icon={<VscBracketError className="font-bold" size={48} />} />
          <Heading1>小工具已下线</Heading1>
        </Column>

        <Text>您正在访问的小工具已在简书小工具集 v3 中下线。</Text>
        <Text>如有疑问，请联系开发者。</Text>

        <SolidButton onClick={() => window.location.replace("/")} fullWidth>
          返回首页
        </SolidButton>
      </Column>
    </Center>
  );
}
