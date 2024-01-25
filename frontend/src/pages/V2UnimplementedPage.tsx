import {
  Center,
  Column,
  Heading1,
  Icon,
  SolidButton,
  Text,
} from "@sscreator/ui";
import { MdAppsOutage } from "react-icons/md";

export default function V2UnimplementedPage() {
  return (
    <Center className="mx-auto h-screen">
      <Column className="max-w-2xl w-[80vw]">
        <Column gap="gap-2">
          <Icon icon={<MdAppsOutage className="font-bold" size={48} />} />
          <Heading1>正在开发中</Heading1>
        </Column>

        <Text>您正在访问的小工具尚未在简书小工具集 v3 中实现。</Text>
        <Text>如有疑问，请联系开发者。</Text>

        <SolidButton onClick={() => window.location.replace("/")} fullWidth>
          返回首页
        </SolidButton>
      </Column>
    </Center>
  );
}
