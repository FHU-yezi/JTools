import { Text, getColorScheme } from "@sscreator/ui";
import { toast } from "react-hot-toast";
import { IoMdCloseCircle } from "react-icons/io";
import { MdCheckCircle, MdOutlineError } from "react-icons/md";

export { Toaster } from "react-hot-toast";

interface ToastFunctionProps {
  message: string;
  duration?: number;
}

export function toastSuccess({ message, duration = 2000 }: ToastFunctionProps) {
  const colorScheme = getColorScheme();

  toast(<Text>{message}</Text>, {
    duration,
    icon: (
      <Text colorScheme="success">
        <MdCheckCircle size={18} />
      </Text>
    ),
    style: {
      backgroundColor: colorScheme === "dark" ? "#27272a" : undefined,
    },
  });
}

export function toastWarning({ message, duration = 4000 }: ToastFunctionProps) {
  const colorScheme = getColorScheme();

  toast(<Text>{message}</Text>, {
    duration,
    icon: (
      <Text colorScheme="warning">
        <MdOutlineError size={18} />
      </Text>
    ),
    style: {
      backgroundColor: colorScheme === "dark" ? "#27272a" : undefined,
    },
  });
}

export function toastError({ message, duration = 4000 }: ToastFunctionProps) {
  const colorScheme = getColorScheme();

  toast(<Text>{message}</Text>, {
    duration,
    icon: (
      <Text colorScheme="danger">
        <IoMdCloseCircle size={18} />
      </Text>
    ),
    style: {
      backgroundColor: colorScheme === "dark" ? "#27272a" : undefined,
    },
  });
}
