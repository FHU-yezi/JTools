import {
  ColorSchemeSwitch,
  Header as HeaderBlock,
  LargeText,
  Row,
  TextButton,
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
      <Row className="h-full w-full justify-between" itemsCenter nowrap>
        <Row gap="gap-2" itemsCenter nowrap>
          {showIcon && (
            <img
              className="h-10 w-10 rounded-full dark:bg-zinc-300"
              src={icon}
              alt="简书小工具集"
            />
          )}
          {!hideBackArrow && (
            <TextButton
              colorScheme="secondary"
              leftIcon={<MdOutlineArrowBack size={22} />}
              onClick={() => setLocation("/")}
            />
          )}
          <LargeText className="max-w-[50vw] overflow-x-hidden" bold nowrap>
            {toolName}
          </LargeText>
        </Row>
        <Row gap="gap-2" itemsCenter nowrap>
          <SearchModal />
          <ColorSchemeSwitch />
        </Row>
      </Row>
    </HeaderBlock>
  );
}
