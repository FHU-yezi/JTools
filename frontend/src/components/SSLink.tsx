import { BiLinkExternal } from "react-icons/bi";

interface Props {
  url: string;
  label?: string;
  isExternal?: boolean;
  hideIcon?: boolean;
}

export default function SSLink({
  url,
  label,
  isExternal = false,
  hideIcon = false,
}: Props) {
  return (
    <a
      className="inline-flex items-center gap-1 break-all text-blue-500 hover:text-blue-600"
      href={url}
      target={isExternal ? "_blank" : "_self"}
      rel="noreferrer"
    >
      {label ?? url}
      {!hideIcon && <BiLinkExternal />}
    </a>
  );
}
