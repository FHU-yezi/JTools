import { notifications } from "@mantine/notifications";

export function commonAPIErrorHandler(
  code: number,
  message: string,
  userErrorToastColor?: string,
) {
  // 参数异常，一般是用户问题
  if (code === 412) {
    notifications.show({
      message: message,
      color: userErrorToastColor ?? "orange",
    });
    return
  }

  notifications.show({
    title: `API 请求失败（${code}）`,
    message: message,
    color: "orange",
  });
}
