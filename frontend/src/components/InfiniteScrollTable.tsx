import type { Signal } from "@preact/signals";
import { Center, LoadingIcon } from "@sscreator/ui";
import type { ComponentChildren } from "preact";
import { useEffect, useMemo, useRef } from "preact/hooks";

interface Props {
  children: ComponentChildren;
  onLoadMore(): void;
  hasMore: Signal<boolean>;
  isLoading: Signal<boolean>;
}

export default function InfiniteScrollTable({
  children,
  onLoadMore,
  hasMore,
  isLoading,
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
    } else {
      observer.unobserve(detector.current!);
    }

    return () => observer.unobserve(detector.current!);
  }, [hasMore.value]);

  return (
    <div className="relative">
      {children}
      <div
        ref={detector}
        className="pointer-events-none absolute bottom-0 h-1 w-full"
        aria-hidden
      />
      {isLoading.value && (
        <Center className="mt-2">
          <LoadingIcon size={36} />
        </Center>
      )}
    </div>
  );
}
