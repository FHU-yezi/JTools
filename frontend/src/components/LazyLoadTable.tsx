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
        <table
          className={clsx(
            className,
            "border border-zinc-300 dark:border-zinc-700 w-full rounded",
          )}
        >
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              {Object.keys(data[0]).map((item) => (
                <th className="border border-zinc-300 px-2 py-1.5 dark:border-zinc-700">
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
                  <td className="border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">
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
