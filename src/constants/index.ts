export const LOGO = "https://dongdong-web3.oss-cn-hangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_222_315.png"
export const BACKEND_DEMAIN = 'https://www.lidongdong.top'  // 请求backend 项目域名
export const WALLET_CONNECT = 'WALLET_CONNECT'  //钱包连接
export const WALLET_GET_ACCOUNT = 'WALLET_GET_ACCOUNT'  //获取钱包账户
export const WALLET_SIGN_MESSAGE = 'WALLET_SIGN_MESSAGE'    //钱包消息签名
export const WALLET_DISCONNECT = 'WALLET_DISCONNECT'    // 钱包断开连接
export interface Network {
  id: string;
  name: string;
  rpcUrl: string;
  chainId: number;
  symbol: string;
  blockExplorerUrl?: string;
}

export const DEFAULT_NETWORKS: Network[] = [
  {
    id: 'sepolia',
    name: 'Ethereum Sepolia Testnet',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/Hqd_61uGu4Xbq16eZ2j5N',
    chainId: 11155111,
    symbol: 'ETH',
    blockExplorerUrl: 'https://sepolia.etherscan.io'
  },
  {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/Hqd_61uGu4Xbq16eZ2j5N',
    chainId: 1,
    symbol: 'ETH',
    blockExplorerUrl: 'https://etherscan.io'
  },
  {
    id: 'polygon',
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/Hqd_61uGu4Xbq16eZ2j5N',
    chainId: 137,
    symbol: 'POL',
    blockExplorerUrl: 'https://polygonscan.com'
  },
  {
    id: 'polygon-amoy',
    name: 'Polygon Amoy Testnet',
    rpcUrl: 'https://polygon-amoy.g.alchemy.com/v2/Hqd_61uGu4Xbq16eZ2j5N',
    chainId: 80002,
    symbol: 'POL',
    blockExplorerUrl: 'https://www.oklink.com/amoy'
  }
];

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  type: 'ERC20' | 'ERC721' | 'ERC1155';
  balance?: string;
  tokenId?: string;
  image?: string;
}