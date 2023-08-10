import clsx from "clsx";
import { BiLinkExternal } from "react-icons/bi";

interface Props {
  className?: string;
  url: string;
  label?: string;
  openInNewTab?: boolean;
  hideIcon?: boolean;
}

export default function SSExternalLink({
  className,
  url,
  label,
  openInNewTab = false,
  hideIcon = false,
}: Props) {
  return (
    <a
      className={clsx(
        className,
        "w-fit break-all text-blue-600 transition-colors hover:text-blue-700 dark:(text-blue-400 hover:text-blue-500)",
      )}
      href={url}
      target={openInNewTab ? "_blank" : "_self"}
      rel="noreferrer"
    >
      {label ?? url}
      {!hideIcon && (
        <BiLinkExternal className={clsx("ml-1 inline", className)} />
      )}
    </a>
  );
}
