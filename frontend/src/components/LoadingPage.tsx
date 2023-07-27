import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import SSCenter from "./SSCenter";
import SSLoader from "./SSLoader";

export default function LoadingPage() {
  const showLoader = useSignal(false);

  useEffect(() => {
    setTimeout(() => (showLoader.value = true), 300);
  }, []);

  return (
    <SSCenter className="mt-[20vh]">
      {showLoader.value && <SSLoader />}
    </SSCenter>
  );
}
