import {
  Center,
  Column,
  Heading1,
  Icon,
  Row,
  SolidButton,
  Text,
} from "@sscreator/ui";

export default function NoLongerAvailablePage() {
  return (
    <Center className="mx-auto h-screen">
      <Column className="max-w-2xl w-[80vw]">
        <Row gap="gap-2" itemsCenter>
          <Icon className="text-3xl" icon="i-mdi-arrow-down-circle-outline" />
          <Heading1>小工具已下线</Heading1>
        </Row>

        <Text>您正在访问的小工具已在简书小工具集 v3 中下线。</Text>
        <Text>如有疑问，请联系开发者。</Text>

        <SolidButton onClick={() => window.location.replace("/")} fullWidth>
          返回首页
        </SolidButton>
      </Column>
    </Center>
  );
}
