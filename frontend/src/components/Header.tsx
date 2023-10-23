import {
  ColorSchemeSwitch,
  GhostButton,
  Header as HeaderBlock,
  Row,
  Text,
} from "@sscreator/ui";
import { MdOutlineArrowBack } from "react-icons/md";
import { useLocation } from "wouter-preact";
import SearchModal from "./SearchModal";
import icon from "/favicon-64.png";

interface Props {
  toolName: string;
  showIcon?: boolean;
  hideBackArrow?: boolean;
}

export default function Header({
  toolName,
  showIcon = false,
  hideBackArrow = false,
}: Props) {
  const [, setLocation] = useLocation();

  return (
    <HeaderBlock>
      <Row className="h-full w-full justify-between" verticalCenter nowrap>
        <Row gap="gap-2" verticalCenter nowrap>
          {showIcon && (
            <img
              className="h-10 w-10 rounded-full dark:bg-zinc-300"
              src={icon}
              alt="简书小工具集"
            />
          )}
          {!hideBackArrow && (
            <GhostButton
              icon={<MdOutlineArrowBack size={22} />}
              hoverBackgroundColor="hover:bg-zinc-200 dark:hover:bg-zinc-700"
              textColor="text-zinc-500 dark:text-zinc-300"
              onClick={() => setLocation("/")}
            />
          )}
          <Text className="max-w-[50vw] overflow-x-hidden" large bold nowrap>
            {toolName}
          </Text>
        </Row>
        <Row gap="gap-2" verticalCenter nowrap>
          <SearchModal />
          <ColorSchemeSwitch />
        </Row>
      </Row>
    </HeaderBlock>
  );
}
