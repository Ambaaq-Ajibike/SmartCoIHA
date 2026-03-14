import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { apiClient } from "@/lib/api-client";

type RequestOptions<TBody = unknown> = Omit<AxiosRequestConfig<TBody>, "url" | "method" | "data">;

type MessageLikeResponse = {
  message?: unknown;
  success?: unknown;
  data?: unknown;
};

export async function request<TResponse, TBody = unknown>(config: AxiosRequestConfig<TBody>) {
  const response = await apiClient.request<TResponse, AxiosResponse<TResponse>, TBody>(config);
  return response.data;
}

export function get<TResponse>(url: string, config?: RequestOptions) {
  return request<TResponse>({
    ...config,
    method: "GET",
    url,
  });
}

export function post<TResponse, TBody = unknown>(
  url: string,
  data?: TBody,
  config?: RequestOptions<TBody>,
) {
  return request<TResponse, TBody>({
    ...config,
    method: "POST",
    url,
    data,
  });
}

export function put<TResponse, TBody = unknown>(
  url: string,
  data?: TBody,
  config?: RequestOptions<TBody>,
) {
  return request<TResponse, TBody>({
    ...config,
    method: "PUT",
    url,
    data,
  });
}

export function patch<TResponse, TBody = unknown>(
  url: string,
  data?: TBody,
  config?: RequestOptions<TBody>,
) {
  return request<TResponse, TBody>({
    ...config,
    method: "PATCH",
    url,
    data,
  });
}

export function remove<TResponse, TBody = unknown>(
  url: string,
  config?: RequestOptions<TBody> & { data?: TBody },
) {
  return request<TResponse, TBody>({
    ...config,
    method: "DELETE",
    url,
    data: config?.data,
  });
}

export function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return "Request failed. Please try again.";
  }

  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (responseData && typeof responseData === "object") {
    const message = responseData.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error.code === "ERR_NETWORK") {
    return "Unable to reach the service. Confirm the API is running and its HTTPS certificate is trusted.";
  }

  return "Request failed. Please review your input and try again.";
}

export function getApiSuccessMessage(responseData: unknown, fallbackMessage: string) {
  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (responseData && typeof responseData === "object") {
    const message = (responseData as MessageLikeResponse).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallbackMessage;
}