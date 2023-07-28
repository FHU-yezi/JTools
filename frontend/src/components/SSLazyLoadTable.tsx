import { Signal, useSignal } from "@preact/signals";
import clsx from "clsx";
import { ComponentChildren } from "preact";
import { useEffect, useMemo, useRef } from "preact/hooks";
import SSCenter from "./SSCenter";
import SSLoader from "./SSLoader";
import SSScolllable from "./SSScollable";
import SSText from "./SSText";

interface Props {
  className?: string;
  data: Record<string, ComponentChildren>[];
  onLoadMore(): void;
  hasMore: Signal<boolean>;
  isLoading: Signal<boolean>;
  threshold?: number;
  tableItemKey?: string;
}

export default function SSLazyLoadTable({
  className,
  data,
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 300,
  tableItemKey,
}: Props) {
  const observerRegistered = useSignal(false);

  const detector = useRef<HTMLDivElement>(null);
  const observer = useMemo(
    () =>
      new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio > 0) {
          onLoadMore();
        }
      }),
    []
  );

  useEffect(() => {
    if (!observerRegistered.value && hasMore.value) {
      observer.observe(detector.current!);
      observerRegistered.value = true;
    }

    return () =>
      observerRegistered.value && observer.unobserve(detector.current!);
  }, []);

  useEffect(() => {
    if (observerRegistered.value && !hasMore.value) {
      observer.unobserve(detector.current!);
      observerRegistered.value = false;
    }
  }, [hasMore.value]);

  return (
    <div className="relative">
      <SSScolllable>
        <table className={clsx(className, "gray-border w-full rounded")}>
          <thead className="color-layer-2">
            <tr>
              {Object.keys(data[0]).map((item) => (
                <th className="gray-border px-2 py-1.5">
                  <SSText className="whitespace-nowrap" bold center>
                    {item}
                  </SSText>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((line) => (
              <tr key={tableItemKey && line[tableItemKey]}>
                {Object.values(line).map((item) => (
                  <td className="gray-border color-layer-1 px-2 py-1.5">
                    {item}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </SSScolllable>
      <div
        ref={detector}
        className="pointer-events-none absolute bottom-0 h-1 w-full"
        style={{ marginBottom: threshold }}
      />
      {isLoading.value && (
        <SSCenter className="mt-2 h-12 w-full">
          <SSLoader />
        </SSCenter>
      )}
    </div>
  );
}
