import {
  ColorSchemeSwitch,
  Header,
  LargeText,
  Row,
  TextButton,
} from "@sscreator/ui";
import { useLocation } from "wouter-preact";
import icon from "/favicon-64.png";
import SearchModal from "./SearchModal";

interface Props {
  pageName?: string;
  isMainPage?: boolean;
}

export default function HeaderBlock({ pageName, isMainPage = false }: Props) {
  const [, setLocation] = useLocation();

  return (
    <Header className="justify-between">
      <Row gap="gap-2" itemsCenter>
        {isMainPage ? (
          <img
            className="h-8 w-8 rounded-full dark:bg-zinc-300"
            src={icon}
            alt="简书小工具集"
          />
        ) : (
          <TextButton
            colorScheme="secondary"
            leftIcon="i-mdi-keyboard-arrow-left"
            onClick={() => setLocation("/")}
          />
        )}
        <LargeText className="overflow-x-hidden" bold nowrap>
          {pageName ?? "简书小工具集"}
        </LargeText>
      </Row>

      <Row itemsCenter>
        <SearchModal />
        <ColorSchemeSwitch />
      </Row>
    </Header>
  );
}
