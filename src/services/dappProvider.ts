// Popup / 调试环境可用的 Provider，与 background 共用 RPC 实现（EIP-1193）
import { useWalletStore } from '../stores/wallet';
import { handleWalletRpcRequest } from './walletRpcHandlers';

export interface WalletProvider {
  isMyWallet: boolean;
  request: (request: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: Function) => void;
  removeListener: (event: string, handler: Function) => void;
  selectedAddress: string | null;
  chainId: string | null;
  networkVersion: string | null;
}

class MyWalletProvider implements WalletProvider {
  public isMyWallet = true;
  public selectedAddress: string | null = null;
  public chainId: string | null = null;
  public networkVersion: string | null = null;

  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.syncStateFromStore();
  }

  private syncStateFromStore() {
    const store = useWalletStore.getState();
    if (store.currentAccount && !store.isLocked) {
      this.selectedAddress = store.currentAccount.address;
      this.chainId = `0x${store.currentNetwork.chainId.toString(16)}`;
      this.networkVersion = store.currentNetwork.chainId.toString();
    } else {
      this.selectedAddress = null;
      this.chainId = null;
      this.networkVersion = null;
    }
  }

  async request(request: { method: string; params?: any[] }): Promise<any> {
    const { method, params = [] } = request;
    const out = await handleWalletRpcRequest(method, params);
    if (out.ok === false) {
      const err = out.error;
      const e = new Error(err.message) as Error & { code?: number };
      e.code = err.code;
      throw e;
    }
    if (method === 'eth_requestAccounts' && Array.isArray(out.result)) {
      this.emit('accountsChanged', out.result);
    }
    if (method === 'wallet_switchEthereumChain') {
      this.syncStateFromStore();
      const cid = useWalletStore.getState().currentNetwork?.chainId;
      if (cid != null) {
        this.emit('chainChanged', `0x${cid.toString(16)}`);
      }
    }
    this.syncStateFromStore();
    return out.result;
  }

  on(event: string, handler: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(handler);
  }

  removeListener(event: string, handler: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(handler);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }
}

export const myWalletProvider = new MyWalletProvider();

/** 仅在扩展页面（如 popup）需要模拟 window.ethereum 时手动调用；网页侧由 injected-helper 注入 */
export const injectProvider = () => {
  if (typeof window !== 'undefined') {
    (window as unknown as { ethereum: MyWalletProvider }).ethereum = myWalletProvider;
    (window as unknown as { mywallet: MyWalletProvider }).mywallet = myWalletProvider;
    window.dispatchEvent(new Event('ethereum#initialized'));
  }
};
