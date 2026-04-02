import { ethers } from 'ethers';
import { useWalletStore } from '../stores/wallet';
import type { Token } from '../constants';

export type RpcError = { code: number; message: string };
export type RpcResult =
  | { ok: true; result: unknown }
  | { ok: false; error: RpcError };

function rpcErr(code: number, message: string): RpcResult {
  return { ok: false, error: { code, message } };
}

function rpcOk(result: unknown): RpcResult {
  return { ok: true, result };
}

/**
 * Background / Popup 共用的 EIP-1193 风格 RPC 实现（无 DOM、无 postMessage）
 */
export async function handleWalletRpcRequest(
  method: string,
  params: unknown[] = []
): Promise<RpcResult> {
  const store = useWalletStore.getState();

  try {
    switch (method) {
      case 'eth_requestAccounts': {
        await store.connect();
        const acc = useWalletStore.getState().currentAccount;
        if (!acc) {
          return rpcErr(4100, 'No account available');
        }
        return rpcOk([acc.address]);
      }

      case 'eth_accounts': {
        const s = useWalletStore.getState();
        if (s.isLocked || !s.isConnected || !s.currentAccount) {
          return rpcOk([]);
        }
        return rpcOk([s.currentAccount.address]);
      }

      /** 扩展：返回与 WALLET_GET_ACCOUNT 一致的 currentAccount 对象 */
      case 'wallet_getAccount': {
        return rpcOk(useWalletStore.getState().currentAccount ?? null);
      }

      /** 扩展：与 WALLET_DISCONNECT 一致 */
      case 'wallet_disconnect': {
        store.disconnect();
        return rpcOk(null);
      }

      case 'personal_sign':
      case 'eth_sign': {
        const raw = params[0];
        let messageStr: string;
        if (typeof raw === 'string' && raw.startsWith('0x')) {
          try {
            messageStr = ethers.toUtf8String(raw);
          } catch {
            messageStr = raw;
          }
        } else {
          messageStr = String(raw ?? '');
        }
        const sig = await store.signMessage(messageStr);
        return rpcOk(sig);
      }

      case 'eth_chainId': {
        const s = useWalletStore.getState();
        if (!s.currentNetwork) {
          return rpcOk(null);
        }
        return rpcOk(`0x${s.currentNetwork.chainId.toString(16)}`);
      }

      case 'net_version': {
        const s = useWalletStore.getState();
        return rpcOk(String(s.currentNetwork?.chainId ?? ''));
      }

      case 'wallet_watchAsset': {
        const p = params[0] as {
          type?: string;
          options?: {
            address?: string;
            symbol?: string;
            decimals?: number;
            image?: string;
          };
        };
        if (!p?.type || !p.options) {
          return rpcErr(4001, 'Invalid params');
        }
        if (!['ERC20', 'ERC721', 'ERC1155'].includes(p.type)) {
          return rpcErr(4001, 'Unsupported asset type');
        }
        const token: Token = {
          address: p.options.address ?? '',
          symbol: p.options.symbol ?? '',
          name: p.options.symbol ?? '',
          decimals: p.options.decimals ?? 18,
          type: p.type as Token['type'],
          image: p.options.image,
        };
        store.addToken(token);
        return rpcOk(true);
      }

      case 'wallet_addEthereumChain': {
        const p = params[0] as {
          chainName?: string;
          chainId?: string;
          rpcUrls?: string[];
          nativeCurrency?: { symbol?: string };
          blockExplorerUrls?: string[];
        };
        if (!p?.chainName || !p.chainId || !p.rpcUrls?.[0]) {
          return rpcErr(4001, 'Invalid addEthereumChain params');
        }
        store.addNetwork({
          id: p.chainName.toLowerCase().replace(/\s+/g, '-'),
          name: p.chainName,
          rpcUrl: p.rpcUrls[0],
          chainId: parseInt(p.chainId, 16),
          symbol: p.nativeCurrency?.symbol ?? 'ETH',
          blockExplorerUrl: p.blockExplorerUrls?.[0],
        });
        return rpcOk(null);
      }

      case 'wallet_switchEthereumChain': {
        const p = params[0] as { chainId?: string };
        if (!p?.chainId) {
          return rpcErr(4001, 'Invalid chainId');
        }
        const chainId = parseInt(p.chainId, 16);
        const s = useWalletStore.getState();
        const network = s.networks.find((net) => net.chainId === chainId);
        if (!network) {
          return rpcErr(4902, 'Network not found');
        }
        store.switchNetwork(network.id);
        return rpcOk(null);
      }

      case 'eth_sendTransaction': {
        return rpcErr(4001, 'Please use the wallet interface to send transactions');
      }

      case 'eth_signTypedData':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4': {
        return rpcErr(4001, 'Typed data signing not implemented');
      }

      default: {
        const provider = store.getProvider();
        if (provider) {
          const result = await provider.send(method, params);
          return rpcOk(result);
        }
        return rpcErr(4200, `Unsupported method: ${method}`);
      }
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return rpcErr(4001, message);
  }
}
