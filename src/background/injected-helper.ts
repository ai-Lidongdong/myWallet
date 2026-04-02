

/**
 * 注入到页面 MAIN world，必须保持自包含（executeScript 序列化时不带外部 import）
 */
export default function injectMyWallet() {
  if ((window as unknown as { myWallet?: unknown }).myWallet || (window as unknown as { myWalletInjected?: boolean }).myWalletInjected) {
    return;
  }

  const generateRequestId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const eventListeners = new Map<string, Function[]>();

  function emit(event: string, data?: unknown) {
    const list = eventListeners.get(event);
    if (!list) return;
    list.forEach((fn) => {
      try {
        fn(data);
      } catch (e) {
        console.error('myWallet listener error', e);
      }
    });
  }

  function _isValidResponse(event: MessageEvent, requestId: string) {
    return (
      event.source === window &&
      !!event.data &&
      event.data.from === 'message-bridge' &&
      event.data.requestId === requestId
    );
  }
  const provider: any = {
    isMyWallet: true,

    request: async function (req: { method: string; params?: unknown[] }) {
      console.log('----request 被调用', req)
      const method = req.method;
      const params = req.params ?? [];
      return new Promise((resolve, reject) => {
        const requestId = generateRequestId();
        console.log('-哈哈')
        window.postMessage(
          {
            type: "WALLET_JSON_RPC",
            requestId,
            from: 'injected-helper',
            method,
            params,
          },
          '*'
        );
        console.log('22')


        const handleResponse = (event: MessageEvent) => {
          if (!_isValidResponse(event, requestId)) return;
          window.removeEventListener('message', handleResponse);
          window.clearTimeout(timeoutId);

          if (event.data.success) {
            const result = event.data.data?.result;
            if (method === 'eth_requestAccounts' && Array.isArray(result)) {
              emit('accountsChanged', result);
            }
            if (method === 'wallet_switchEthereumChain') {
              void provider.request({ method: 'eth_chainId' }).then((cid: unknown) => {
                if (typeof cid === 'string') emit('chainChanged', cid);
              });
            }
            resolve(result);
          } else {
            const msg =
              event.data.error ||
              event.data.data?.error ||
              'RPC error';
            const err = new Error(typeof msg === 'string' ? msg : String(msg)) as Error & {
              code?: number;
            };
            if (event.data.data?.code != null) {
              err.code = event.data.data.code;
            }
            reject(err);
          }
        };

        window.addEventListener('message', handleResponse);
        const timeoutId = window.setTimeout(() => {
          window.removeEventListener('message', handleResponse);
          reject(new Error('Request timeout'));
        }, 30000);
      });
    },

    connect: async function () {
      await provider.request({ method: 'eth_requestAccounts' });
      return provider.request({ method: 'wallet_getAccount' });
    },

    getAccount: async function () {
      return provider.request({ method: 'wallet_getAccount' });
    },

    signMessage: async function (message: string) {
      const accounts = (await provider.request({
        method: 'eth_accounts',
      })) as string[];
      const addr = accounts[0];
      if (!addr) {
        throw new Error('未连接钱包');
      }
      return provider.request({
        method: 'personal_sign',
        params: [message, addr],
      });
    },

    disconnect: async function () {
      await provider.request({ method: 'wallet_disconnect' });
      emit('accountsChanged', []);
      return true;
    },

    on: function (event: string, handler: Function) {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, []);
      }
      eventListeners.get(event)!.push(handler);
    },

    removeListener: function (event: string, handler: Function) {
      const list = eventListeners.get(event);
      if (!list) return;
      const i = list.indexOf(handler);
      if (i > -1) list.splice(i, 1);
    },
  };

  (window as unknown as { myWallet: typeof provider }).myWallet = provider;
  (window as unknown as { ethereum: typeof provider }).ethereum = provider;
  (window as unknown as { myWalletInjected: boolean }).myWalletInjected = true;
  window.dispatchEvent(new Event('ethereum#initialized'));
}
