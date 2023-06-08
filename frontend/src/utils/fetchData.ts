import { notifications } from "@mantine/notifications";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { Response } from "../models/base";

export enum fetchStatus {
  REQUEST_ERROR = 0,
  NO_RESPONSE = 1,
  HTTP_CODE_ERROR = 2,
  API_CODE_ERROR = 3,
  OK = 4,
}

interface fetchResult<TData> {
  status: fetchStatus;
  httpCode?: number;
  apiCode?: number;
  message?: string;
  data?: TData;
}

export async function fetchData<TReq, TRes>(
  method: "GET" | "POST",
  url: string,
  data?: TReq,
  timeout?: number,
): Promise<fetchResult<TRes>> {
  const reqConfig: AxiosRequestConfig = {
    method: method,
    url: url,
    timeout: timeout,
  };
  if (method === "GET") {
    reqConfig.params = data;
  } else {
    reqConfig.data = data;
  }
  return axios<Response<TRes>>(reqConfig)
    .then((res) => {
      if (res.data.ok) {
        // 正常
        return {
          status: fetchStatus.OK,
          httpCode: res.status,
          apiCode: res.data.code,
          message: res.data.message,
          data: res.data.data,
        };
      } else {
        // API Code 异常
        notifications.show({
          title: "API 请求异常",
          message: `${res.data.message}（ API ${res.data.code}）`,
          color: "red",
        });
        return {
          status: fetchStatus.API_CODE_ERROR,
          httpCode: res.status,
          apiCode: res.data.code,
          message: res.data.message,
          data: res.data.data,
        };
      }
    })
    .catch((err: AxiosError<TRes>) => {
      if (err.response) {
        // HTTP 状态码异常
        const res = err.response;
        let errName = "未知异常";
        if (300 <= res.status && res.status <= 399) {
          errName = "意料外的重定向";
        } else if (400 <= res.status && res.status <= 499) {
          errName = "客户端错误";
        } else if (500 <= res.status && res.status <= 599) {
          errName = "服务端错误";
        }
        notifications.show({
          title: "API 请求异常",
          message: `${errName}（HTTP ${res.status} ${res.statusText}）`,
          color: "red",
        });
        return { status: fetchStatus.HTTP_CODE_ERROR, httpCode: res.status };
      } else if (err.request) {
        // 请求超时
        notifications.show({
          title: "API 请求异常",
          message: `请求超时（${err.message}）`,
          color: "red",
        });
        return { status: fetchStatus.NO_RESPONSE };
      } else {
        // 请求构建失败
        notifications.show({
          title: "API 请求异常",
          message: `请求发送失败（${err.message}）`,
          color: "red",
        });
        return { status: fetchStatus.REQUEST_ERROR };
      }
    });
}