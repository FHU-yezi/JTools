import { toastError, toastWarning } from "./toastHelper";

export function commonAPIErrorHandler(code: number, message: string) {
  // 参数异常，一般是用户问题
  if (code === 412) {
    toastWarning({ message });
    return;
  }

  toastError({ message: `API 请求失败（${code}）\n${message}` });
}
