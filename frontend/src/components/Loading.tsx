import { Center, Loader } from "@mantine/core";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

export default function Loading() {
  const showLoader = useSignal(false);

  useEffect(() => {
    setTimeout(() => (showLoader.value = true), 300);
  }, []);

  return (
    <Center style={{ marginTop: "20vh" }}>
      {showLoader.value && <Loader size="lg" variant="dots" />}
    </Center>
  );
}
