import type { AxiosRequestConfig } from "axios"
import service from "./service"

/**
 * GET：第二参数为 query（拼在 URL 上）
 */
export const fetchGet = (
  url: string,
  params: Record<string, unknown> = {},
  config: AxiosRequestConfig = {}
) => {
  return service({
    method: "get",
    url,
    params,
    ...config
  })
}

/**
 * POST：第二参数为请求体（默认 JSON，与实例 headers 一致）
 * 若需要同时带 query，可第三参传入 `{ params: { ... } }`
 */
export const fetchPost = (
  url: string,
  data: unknown = {},
  config: AxiosRequestConfig = {}
) => {
  return service({
    method: "post",
    url,
    data,
    ...config
  })
}

/**
 * POST：第二参数为请求体（默认 JSON，与实例 headers 一致）
 * 若需要同时带 query，可第三参传入 `{ params: { ... } }`
 */
export const fetchPut = (
  url: string,
  data: unknown = {},
  config: AxiosRequestConfig = {}
) => {
  return service({
    method: "put",
    url,
    data,
    ...config
  })
}