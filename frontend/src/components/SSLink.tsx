import clsx from "clsx";
import { BiLinkExternal } from "react-icons/bi";

interface Props {
  className?: string;
  url: string;
  label?: string;
  isExternal?: boolean;
  hideIcon?: boolean;
}

export default function SSLink({
  className,
  url,
  label,
  isExternal = false,
  hideIcon = false,
}: Props) {
  return (
    <a
      className={clsx(
        className,
        "inline-flex items-center gap-1 break-all text-blue-500 hover:text-blue-600"
      )}
      href={url}
      target={isExternal ? "_blank" : "_self"}
      rel="noreferrer"
    >
      {label ?? url}
      {!hideIcon && <BiLinkExternal />}
    </a>
  );
}
