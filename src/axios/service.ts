import axios from "axios";
import { BACKEND_DEMAIN } from '../constants'
// 创建 Axios 实例
const service = axios.create({
  baseURL: BACKEND_DEMAIN, // 基础地址
  timeout: 10000, // 超时时间（10秒）
      headers: { 
    "Content-Type": "application/json;charset=utf-8" // 默认请求头
     },
});

// 存储当前所有请求的取消函数（用于取消请求）
const cancelTokenSourceMap = new Map();

/**
 * 生成请求唯一标识（用于取消重复请求）
 * @param {Object} config - Axios 请求配置
 */
const getRequestKey = (config) => {
  const { method, url, params, data } = config;
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join("&");
};

// 请求拦截器：处理请求发送前的逻辑
service.interceptors.request.use(
  (config) => {
    // 1. 添加 Token（如需要身份验证的接口）
    // 2. 处理重复请求：取消之前未完成的同类型请求
    const requestKey = getRequestKey(config);
    const prevCancel = cancelTokenSourceMap.get(requestKey);
    if (prevCancel) {
      try {
        prevCancel("duplicate request")
      } catch {
        /* ignore */
      }
      cancelTokenSourceMap.delete(requestKey)
    }
    const source = axios.CancelToken.source()
    config.cancelToken = source.token
    cancelTokenSourceMap.set(requestKey, source.cancel)

    return config;
  },
  (error) => {
    // 请求发送失败（如参数错误）
    return Promise.reject(error);
  }
);

// 响应拦截器：处理接口返回后的逻辑
service.interceptors.response.use(
  (response) => {
    // 1. 移除当前请求的取消函数
    const requestKey = getRequestKey(response.config);
    cancelTokenSourceMap.delete(requestKey);

    // 2. 解析响应数据（假设后端统一返回 { code, data, message } 格式）
    const { status, data } = response;

    // 3. 根据业务状态码处理
    // axios 成功回调里 status 为 2xx；401 会进 error 分支，不会走到这里
    if (status >= 200 && status < 300) {
      return data
    }
    return Promise.reject(new Error(`请求异常：HTTP ${status}`))
  },
  (error) => {
    // 1. 移除当前请求的取消函数（如果存在）
    if (error.config) {
      const requestKey = getRequestKey(error.config);
      cancelTokenSourceMap.delete(requestKey);
    }

    // 2. 处理网络错误或超时
    if (axios.isCancel(error)) {
      // 主动取消的请求（如重复请求），不提示错误
      return Promise.reject(error);
    } else if (!error.response) {
      // 无响应（网络中断或超时）
    //   ElMessage.error("网络异常，请检查网络连接");
    // message.error({
    //     content: '网络异常，请检查网络连接',
    // })
    } else {
      const status = error.response.status
      const message = error.response.data?.message || `请求失败（${status}）`
      if (status === 401) {
        // 扩展内不宜 window.location.href 到 /login，可按需改为 hash 路由
        return Promise.reject(new Error(message || "未授权"))
      }
      return Promise.reject(new Error(message))
    }

    return Promise.reject(error);
  }
);

export default service;