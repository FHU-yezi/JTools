import type { ResponseStruct } from "../models/responseStruct";
import { getBaseURL } from "./URLHelper";

const BASE_URL = `${getBaseURL()}/api`;

function buildQueryArgsString(originalQueryArgs: Record<string, any>) {
  const paramsObj = new URLSearchParams();
  Object.entries(originalQueryArgs).forEach(([key, value]) => {
    // 剔除值为 undefined / null 的项
    if (value === undefined || value === null) {
      return;
    }
    // 对于数组类型，多次添加 key-value 对
    if (Array.isArray(value)) {
      value.forEach((x) => paramsObj.append(key, x));
    } else {
      paramsObj.append(key, value);
    }
  });

  return paramsObj.toString().length ? `?${paramsObj.toString()}` : "";
}

function buildBodyString(originalBody: Record<string, any>) {
  // 剔除值为 undefined / null 的项
  const filteredBody = Object.fromEntries(
    Object.entries(originalBody).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );

  return JSON.stringify(filteredBody);
}

export interface FetcherArgs<TRequest> {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
  body?: TRequest;
  queryArgs?: TRequest;
}

export async function fetcher<TRequest>({
  method,
  endpoint,
  queryArgs,
  body,
}: FetcherArgs<TRequest>) {
  let url = "";
  // 如果是 GET 请求且传入了 Query Args，构建请求参数字符串并拼接 URL
  if (method === "GET" && queryArgs) {
    const queryArgsString = buildQueryArgsString(queryArgs);
    url = `${BASE_URL}${endpoint}${queryArgsString}`;
  } else {
    url = `${BASE_URL}${endpoint}`;
  }

  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? buildBodyString(body) : undefined,
    credentials: "omit",
  });

  // HTTP 状态码异常
  if (!response.ok) {
    throw Error(`HTTP Error ${response.status}：${response.statusText}`);
  }

  const json = (await response.json()) as ResponseStruct<Record<string, any>>;
  // API 状态码异常
  if (!json.ok) {
    throw Error(`API Error ${json.code}：${json.msg}`);
  }

  return json.data;
}
