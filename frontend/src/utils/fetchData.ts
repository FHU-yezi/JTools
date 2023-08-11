import type { Signal } from "@preact/signals";
import type { Response } from "../models/base";
import { getBaseURL } from "./URLHelper";
import { toastError } from "./toastHelper";

const baseURL = getBaseURL();
const defaultTimeout = 5000;

export async function fetchData<TRequest, TResponse>(
  method: "GET" | "POST",
  url: string,
  data: TRequest,
  onOK: (data: TResponse) => void,
  onError: (code: number, message: string) => void,
  isLoading?: Signal<boolean>,
  timeout?: number,
) {
  if (isLoading) {
    // 如果数据正在加载，不再发起新的请求
    if (isLoading.value === true) {
      return;
    }

    // 否则，标记为正在加载
    isLoading.value = true;
  }

  // 如果是 GET 请求，从 data 对象构建查询字符串
  url = `${baseURL}/api${url}`;
  if (method === "GET") {
    const params: string[] = [];
    Object.entries(data as object).forEach(([key, value]) =>
      params.push(`${key}=${value}`),
    );
    url = `${url}?${params.join("&")}`;
  }

  let response;
  const controller = new AbortController();
  try {
    const timeoutID = setTimeout(
      () => controller.abort(),
      timeout ?? defaultTimeout,
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
    // 请求未正常完成
    if (isLoading) {
      isLoading.value = false;
    }

    if ((error as any).name === "AbortError") {
      toastError(
        `请求超时（${
          timeout ?? defaultTimeout
        }ms）\n请尝试刷新页面，如该问题反复出现，请向开发者反馈`,
      );
      return;
    }

    toastError("网络异常\n请尝试刷新页面，如该问题反复出现，请向开发者反馈");
    return;
  }

  if (!response.ok) {
    // 请求完成但 HTTP 状态码异常
    if (isLoading) {
      isLoading.value = false;
    }

    toastError(
      `API 请求失败\nHTTP ${response.status}（${response.statusText}）`,
    );
    return;
  }

  const responseJSON = (await response.json()) as Response<TResponse>;
  if (responseJSON.ok) {
    // API 状态码正常
    onOK(responseJSON.data);
  } else {
    // API 状态码异常
    onError(responseJSON.code, responseJSON.message);
  }

  if (isLoading) {
    isLoading.value = false;
  }
}
