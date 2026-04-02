import { WALLET_JSON_RPC } from '../constants';
/**
 * 桥接脚本
 *
 * 网页(injected-helper)消息 => 桥接(message-bridge)转发 => background =>
 * 桥接将处理的信息转给网页
 */

window.addEventListener('message', (event) => {
  console.log('收到injected-helper的消息：', event);
  if (
    event.source !== window ||
    !event.data ||
    event.data.from !== 'injected-helper' ||
    !event.data.type ||
    !event.data.requestId
  ) {
    return;
  }

  const payload =
    event.data.type === WALLET_JSON_RPC
      ? {
          method: event.data.method,
          params: event.data.params ?? [],
        }
      : event.data.data;

  chrome.runtime.sendMessage(
    {
      type: event.data.type,
      requestId: event.data.requestId,
      data: payload,
    },
    (response) => {
      console.log('收到来自 background 的响应：', response);
      if (chrome.runtime.lastError) {
        console.error('转发消息到background失败：', chrome.runtime.lastError);
        window.postMessage(
          {
            from: 'message-bridge',
            requestId: event.data.requestId,
            success: false,
            data: {},
            error: chrome.runtime.lastError.message,
          },
          '*'
        );
        return;
      }
      const d = response?.data ?? {};
      const failed = d.error != null && d.error !== '';
      window.postMessage(
        {
          from: 'message-bridge',
          requestId: event.data.requestId,
          success: !failed,
          data: d,
          error: failed ? d.error : undefined,
        },
        '*'
      );
    }
  );
});
