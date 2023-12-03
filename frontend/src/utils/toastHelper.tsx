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
      <Text color="text-green-400 dark:text-green-600">
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
      <Text color="text-orange-400 dark:text-orange-600">
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
      <Text color="text-red-400 dark:text-red-600">
        <IoMdCloseCircle size={18} />
      </Text>
    ),
    style: {
      backgroundColor: colorScheme === "dark" ? "#27272a" : undefined,
    },
  });
}
