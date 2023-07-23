import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import SSLoader from "./SSLoader";

export default function LoadingPage() {
  const showLoader = useSignal(false);

  useEffect(() => {
    setTimeout(() => (showLoader.value = true), 300);
  }, []);

  return (
    <div className="mt-[20vh] grid place-content-center">
      {showLoader.value && <SSLoader />}
    </div>
  );
}
