import toast from "react-hot-toast";

export function commonAPIErrorHandler(code: number, message: string) {
  // 参数异常，一般是用户问题
  if (code === 412) {
    toast(message, {
      icon: " ⚠️",
    });
    return;
  }

  toast.error(`API 请求失败（${code}）\n${message}`);
}
