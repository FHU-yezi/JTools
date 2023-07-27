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
        "break-all text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"
      )}
      href={url}
      target={isExternal ? "_blank" : "_self"}
      rel="noreferrer"
    >
      {label ?? url}
      {!hideIcon && (
        <BiLinkExternal className={clsx("ml-1 inline", className)} />
      )}
    </a>
  );
}
