import { Center, Column, Heading1, Icon, SolidButton } from "@sscreator/ui";
import { MdCancelScheduleSend } from "react-icons/md";

export default function NotFoundPage() {
  return (
    <Center className="mx-auto h-screen">
      <Column className="max-w-2xl w-[80vw]">
        <Column gap="gap-2">
          <Icon
            icon={<MdCancelScheduleSend className="font-bold" size={48} />}
          />
          <Heading1>页面走丢了...</Heading1>
        </Column>

        <SolidButton onClick={() => window.location.replace("/")} fullWidth>
          返回首页
        </SolidButton>
      </Column>
    </Center>
  );
}
