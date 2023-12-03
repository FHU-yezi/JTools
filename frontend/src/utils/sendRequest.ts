import type { Signal } from "@preact/signals";
import type { ResponseStruct } from "../models/responseStruct";
import { getBaseURL } from "./URLHelper";
import { commonAPIErrorHandler } from "./errorHandler";

const BASE_URL = `${getBaseURL()}/api`;
const DEFAULT_TIMEOUT = 5000;

interface SuccessCallbackArgs<TResponse> {
  code: number;
  msg: string;
  data: TResponse;
}

export interface ErrorCallbackArgs {
  error?: Error;
  httpCode?: number;
  httpMsg?: string;
  ApiCode?: number;
  ApiMsg?: string;
}

interface SendRequestArgs<
  TRequest extends Record<string, any>,
  TResponse extends Record<string, any>,
> {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TRequest;
  queryArgs?: TRequest;
  onSuccess?: (data: SuccessCallbackArgs<TResponse>) => void;
  onError?: (data: ErrorCallbackArgs) => void;
  isLoading?: Signal<boolean>;
  timeout?: number;
}

export async function sendRequest<
  TRequest extends Record<string, any>,
  TResponse extends Record<string, any>,
>({
  endpoint,
  method,
  body,
  queryArgs,
  onSuccess,
  onError = commonAPIErrorHandler,
  isLoading,
  timeout = DEFAULT_TIMEOUT,
}: SendRequestArgs<TRequest, TResponse>) {
  if (isLoading && isLoading.value) {
    // 正在加载，不再重复发起请求
    return;
  }

  // 标记为正在加载
  if (isLoading) {
    isLoading.value = true;
  }

  let url = `${BASE_URL}${endpoint}`;
  // 如果是 GET 请求，构建并拼接 Query Args
  if (method === "GET" && queryArgs) {
    const params = new URLSearchParams();
    Object.entries(queryArgs).forEach(([key, value]) => {
      // 剔除值为 undefined 的 Query Args
      if (value === undefined) {
        return;
      }
      // 对于数组类型，多次添加相同 key 的参数
      if (Array.isArray(value)) {
        value.forEach((x) => params.append(key, x));
      } else {
        params.append(key, value);
      }
    });
    url = params.toString().length === 0 ? url : `${url}?${params.toString()}`;
  } else if (body) {
    // 剔除值为 undefined 的 Body 键值对
    body = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(body).filter(([_, value]) => value != null),
    ) as TRequest;
  }

  let response: Response;
  const controller = new AbortController();
  try {
    const timeoutID = setTimeout(() => controller.abort(), timeout);

    response = await fetch(url, {
      method,
      headers:
        body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "omit",
      signal: controller.signal,
    });
    clearTimeout(timeoutID);

    // 发生异常
  } catch (error) {
    // 取消加载状态
    if (isLoading && isLoading.value) {
      isLoading.value = false;
    }

    if (onError) {
      onError({
        error: error as Error,
      });
    }

    return;
  }

  // 请求完成，取消加载状态
  if (isLoading && isLoading.value) {
    isLoading.value = false;
  }

  // HTTP 状态码异常
  if (!response.ok) {
    try {
      // 有 API 返回数据
      const { code, msg } =
        (await response.json()) as ResponseStruct<TResponse>;

      if (onError) {
        onError({
          httpCode: response.status,
          httpMsg: response.statusText,
          ApiCode: code,
          ApiMsg: msg,
        });
      }
    } catch {
      // 无 API 返回数据
      if (onError) {
        onError({
          httpCode: response.status,
          httpMsg: response.statusText,
        });
      }
    }
    return;
  }

  // HTTP 状态码正常
  const responseJson = (await response.json()) as ResponseStruct<TResponse>;
  const { ok, code, msg, data } = responseJson;

  // API 错误
  if (!ok && onError) {
    onError({
      httpCode: response.status,
      httpMsg: response.statusText,
      ApiCode: code,
      ApiMsg: msg,
    });

    return;
  }

  if (onSuccess) {
    onSuccess({
      code,
      msg,
      data,
    });
  }
}
