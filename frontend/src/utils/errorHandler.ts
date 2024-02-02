import { toastError, toastWarning } from "@sscreator/ui";
import type { ErrorCallbackArgs } from "./sendRequest";

export function commonAPIErrorHandler({
  httpCode,
  httpMsg,
  ApiCode,
  ApiMsg,
  error,
}: ErrorCallbackArgs) {
  // 请求超时
  if (error?.name === "AbortError") {
    toastError({
      message: "请求超时，请重试或更换网络环境",
    });
    return;
  }

  // 其它阻止请求正常发送的异常
  if (error && !httpCode && !ApiCode) {
    toastError({
      message: "网络异常，请重试或更换网络环境",
    });
    return;
  }

  // BAD ARGUMENTS，一般是用户传入参数无效导致
  if (ApiCode && ApiMsg && ApiCode === 203) {
    toastWarning({
      message: ApiMsg,
    });
    return;
  }

  if (ApiCode && ApiMsg) {
    toastError({
      message: `${ApiMsg}\n（HTTP ${httpCode} / API ${ApiCode}）`,
    });
  }

  if (httpCode && httpMsg && !ApiCode && !ApiMsg) {
    toastError({
      message: `未知错误\n${httpMsg}（HTTP ${httpCode}）`,
    });
  }
}

export function onError(error: Error) {
  // BAD ARGUMENTS，一般是用户传入参数无效导致
  if (error.message.includes("API Error 203")) {
    toastWarning({
      message: error.message,
    });
    return;
  }

  toastError({
    message: error.message,
  });
}
