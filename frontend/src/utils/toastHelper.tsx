import { toast } from "react-hot-toast";
import { RiErrorWarningFill } from "react-icons/ri";
import SSText from "../components/SSText";

export function toastSuccess(message: string, duration?: number) {
  toast.success(message, {
    duration,
  });
}

export function toastWarning(message: string, duration?: number) {
  toast(message, {
    duration,
    icon: (
      <SSText color="text-orange-400">
        <RiErrorWarningFill size={18} />
      </SSText>
    ),
  });
}

export function toastError(message: string, duration?: number) {
  toast.error(message, {
    duration,
  });
}
