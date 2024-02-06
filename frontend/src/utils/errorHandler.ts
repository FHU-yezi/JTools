import { toastDanger, toastWarning } from "@sscreator/ui";

export function onError(error: Error) {
  // BAD ARGUMENTS，一般是用户传入参数无效导致
  if (error.message.includes("API Error 203")) {
    toastWarning(error.message);
    return;
  }

  toastDanger(error.message);
}
