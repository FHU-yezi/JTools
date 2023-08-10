import clsx from "clsx";
import { BiLinkExternal } from "react-icons/bi";
import { useLocation } from "wouter-preact";

interface Props {
  className?: string;
  url: string;
  label?: string;
  hideIcon?: boolean;
}

export default function SSInternalLink({
  className,
  url,
  label,
  hideIcon = false,
}: Props) {
  const [, setLocation] = useLocation();

  return (
    <div
      role="link"
      tabIndex={0}
      className={clsx(
        className,
        "w-fit break-all text-blue-600 transition-colors hover:text-blue-700 cursor-pointer dark:(text-blue-400 hover:text-blue-500)",
      )}
      onClick={() => setLocation(url)}
      onKeyPress={() => setLocation(url)}
    >
      {label ?? url}
      {!hideIcon && (
        <BiLinkExternal className={clsx("ml-1 inline", className)} />
      )}
    </div>
  );
}
