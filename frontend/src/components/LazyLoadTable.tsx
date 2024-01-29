import type { Signal } from "@preact/signals";
import { Center, HorizontalScoll, LoadingIcon, Text } from "@sscreator/ui";
import clsx from "clsx";
import type { ComponentChildren } from "preact";
import { useEffect, useMemo, useRef } from "preact/hooks";

interface Props {
  className?: string;
  data: Record<string, ComponentChildren>[];
  onLoadMore(): void;
  hasMore: Signal<boolean>;
  isLoading: Signal<boolean>;
  threshold?: number;
  tableItemKey?: string;
}

export default function LazyLoadTable({
  className,
  data,
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 300,
  tableItemKey,
}: Props) {
  const detector = useRef<HTMLDivElement>(null);
  const observer = useMemo(
    () =>
      new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio > 0) {
          onLoadMore();
        }
      }),
    [],
  );

  useEffect(() => {
    if (hasMore.value) {
      observer.observe(detector.current!);
    }

    return () => observer.unobserve(detector.current!);
  }, [hasMore.value]);

  useEffect(() => {
    if (!hasMore.value) {
      observer.unobserve(detector.current!);
    }
  }, [hasMore.value]);

  return (
    <div className="relative">
      <HorizontalScoll>
        <table className={clsx(className, "gray-border w-full rounded")}>
          <thead className="color-layer-2">
            <tr>
              {Object.keys(data[0]).map((item) => (
                <th className="gray-border px-2 py-1.5">
                  <Text className="whitespace-nowrap text-center" bold>
                    {item}
                  </Text>
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
      </HorizontalScoll>
      <div
        ref={detector}
        className="pointer-events-none absolute bottom-0 h-1 w-full"
        style={{ marginBottom: threshold }}
      />
      {isLoading.value && (
        <Center className="mt-2 h-12 w-full">
          <LoadingIcon size={24} />
        </Center>
      )}
    </div>
  );
}
