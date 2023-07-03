import { notifications } from "@mantine/notifications";
import { Signal } from "@preact/signals";
import { Response } from "../models/base";
import { getBaseURL } from "./URLHelper";

const baseURL = getBaseURL();
const defaultTimeout = 5000;

export async function fetchData<TRequest, TResponse>(
  method: "GET" | "POST",
  url: string,
  data?: TRequest,
  // eslint-disable-next-line no-shadow, no-unused-vars
  onOK?: (data: TResponse) => void,
  // eslint-disable-next-line no-unused-vars
  onError?: (code: number, message: string) => void,
  hasResult?: Signal<boolean>,
  isLoading?: Signal<boolean>,
  timeout?: number
) {
  if (hasResult) {
    hasResult.value = false;
  }
  if (isLoading) {
    // 如果数据正在加载，不再发起新的请求
    if (isLoading.value === true) {
      return;
    }
    isLoading.value = true;
  }

  url = `${baseURL}/api${url}`;
  if (method === "GET" && typeof data !== "undefined") {
    const params: string[] = [];
    Object.entries(data as object).forEach(([key, value]) =>
      params.push(`${key}=${value}`)
    );
    url = `${url}?${params.join("&")}`;
  }

  let response;
  const controller = new AbortController();
  try {
    const timeoutID = setTimeout(
      () => controller.abort(),
      timeout ?? defaultTimeout
    );
    response = await fetch(url, {
      method,
      headers:
        method !== "GET" ? { "Content-Type": "application/json" } : undefined,
      body: method !== "GET" ? JSON.stringify(data) : undefined,
      credentials: "omit",
      redirect: "error",
      signal: controller.signal,
    });
    clearTimeout(timeoutID);
  } catch (error) {
    if (isLoading) {
      isLoading.value = false;
    }
    if ((error as any).name === "AbortError") {
      notifications.show({
        title: `请求超时（${timeout ?? defaultTimeout}ms）`,
        message: "请尝试刷新页面，如该问题反复出现，请向开发者反馈",
        color: "red",
      });
      throw new Error("请求超时");
    }
    notifications.show({
      title: "网络异常",
      message: "请尝试刷新页面，如该问题反复出现，请向开发者反馈",
      color: "red",
    });
    throw new Error("网络异常");
  }

  if (!response.ok) {
    if (isLoading) {
      isLoading.value = false;
    }
    notifications.show({
      title: "API 请求失败",
      message: `HTTP ${response.status}（${response.statusText}）`,
      color: "red",
    });
    throw new Error(
      `API 请求失败：HTTP ${response.status}（${response.statusText}）`
    );
  } else {
    const responseJSON = (await response.json()) as Response<TResponse>;
    if (responseJSON.ok) {
      if (onOK) {
        onOK(responseJSON.data);
        if (hasResult) {
          hasResult.value = true;
        }
      }
    } else if (onError) {
      onError(responseJSON.code, responseJSON.message);
    }
    if (isLoading) {
      isLoading.value = false;
    }
  }
}
