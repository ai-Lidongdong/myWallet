import React from 'react';
import type { NetworkItem } from '../types/wallet';
import { ChainSheet } from '../components/ChainSheet';
import { shortAddr } from '../lib/address';
import { useWalletStore } from '../stores/wallet';
import { Link } from "react-router-dom";
import { fetchPut } from '../axios';

const DashboardPage = () => {
  const [showChainSheet, setShowChainSheet] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const { currentAccount, chainId, networks } = useWalletStore();
  const walletName = '默认钱包';

  const copyToClipboard = async () => {
    if (!currentAccount) return;
    try {
      await navigator.clipboard.writeText(currentAccount.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Fallback：某些环境下 clipboard API 不可用
      try {
        const ta = document.createElement('textarea');
        ta.value = currentAccount.address;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      } catch {
        // 静默失败（后续你也可以让我补 toast/错误提示）
      }
    }
  };

  React.useEffect(() => {
    const run = async () => {
      // const res = await chrome.runtime.sendMessage({ method: 'wallet_getNetworks' });
      // console.log('---res', res)
      // setNetworks(res as any);
    };
    void run();
  }, []);

  const changeChain = async (chainId: string) => {
    await chrome.runtime.sendMessage({ method: 'wallet_setChainId', params: { chainId } });
    setShowChainSheet(false);
    window.location.reload();
  };

  const chainName = networks.find((n) => n.chainId === chainId)?.name || chainId;


  type DashboardGridItem = { label: string; url: string; logo: string };
  const gridItems: DashboardGridItem[] = [
    { label: '兑换', url: '', logo: '' },
    { label: '发送', url: '', logo: '' },
    { label: '接收', url: '', logo: '' },
    { label: '交易记录', url: '', logo: '' },
    { label: 'NFT', url: '', logo: '' },
    { label: '借贷', url: '', logo: '' },
    { label: 'DAPPS', url: '', logo: '' },
    { label: 'GasAccount', url: '', logo: '' },
    { label: 'Mobile', url: '', logo: '' },
  ];

  const navigateGridUrl = (url: string) => {
    const u = url.trim();
    if (!u) return;
    if (u.startsWith('#')) {
      window.location.hash = u;
      return;
    }
    window.open(u, '_blank', 'noopener,noreferrer');
  };
  return (
    <div className="w-[360px] min-h-[540px] bg-[#f7f7f8] text-black relative">
      {/* 顶部橙色余额区（参考首页.png） */}
      <section className="relative h-[220px] bg-[#f07a2a] overflow-hidden">
        {/* <div className="absolute inset-0 bg-[radial-gradient(600px_240px_at_40%_0%,rgba(255,255,255,0.18),transparent_60%)]" /> */}

        {/* 资产展示模块（灰白色卡片，参考你给的“这一行图”） */}
        <div className="absolute left-4 right-4 top-[76px] rounded-[18px] bg-white/10 border border-white/10 h-[132px] flex items-center justify-between px-7">
          <div className="flex flex-col justify-center">
            <div className="text-[44px] font-extrabold leading-none text-white">$0</div>
            <div className="mt-3 text-[16px] font-bold text-white/85">没有资产</div>
          </div>
          <div className="flex items-center justify-center text-white/80 text-[36px] leading-none pr-1">
            ›
          </div>
        </div>

        {/* 账号展示模块：顶部左上角（更紧凑、融入橙色背景） */}
        <div className="absolute left-3 top-[24px] w-[220px]">
          <section className="bg-white/10 rounded-[12px] border border-white/10 px-3 py-0.5 flex items-center justify-between gap-2">
            <Link to="/accounts">
              <button
                type="button"
                className="flex flex-col items-start justify-center min-w-0 flex-1 text-left cursor-pointer"
              >
                <div className="text-[12.5px] leading-[14px] font-extrabold text-white truncate">{walletName}</div>
                <div className="mt-[2px] text-[11px] leading-[12px] font-semibold text-white/85 truncate">
                  {shortAddr(currentAccount?.address || '')}
                </div>
              </button>
            </Link>

            <button
              type="button"
              className="w-9 h-9 rounded-[12px] bg-white/10 border border-white/10 flex items-center justify-center cursor-pointer"
              onClick={() => void copyToClipboard()}
              aria-label="复制钱包地址"
              title="复制钱包"
            >
              {copied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M9 9h10v10H9V9Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </section>
        </div>
        {/* 右上角按钮：连接 + 设置（视觉占位） */}
        <div className="absolute right-5 top-6 flex items-center gap-3">
          <button
            type="button"
            className="w-10 h-10 rounded-[10px] bg-white/10 border border-white/10 flex items-center justify-center"
            onClick={() => setShowChainSheet(true)}
            aria-label="连接"
            title="连接"
          >
            <img
              src={"https://dongdong-web3.oss-cn-hangzhou.aliyuncs.com/images/chain_lisg.png"}
              alt=""
              className="w-[22px] h-[22px] object-contain"
            />
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-[10px] bg-white/10 border border-white/10 flex items-center justify-center"
            onClick={() => {
              window.location.hash = '#/settings';
            }}
            aria-label="设置"
            title="设置"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                stroke="white"
                strokeWidth="2"
              />
              <path
                d="M19.4 15a1.8 1.8 0 0 0 .3 2l.1.1a2.2 2.2 0 0 1-1.6 3.8 2.2 2.2 0 0 1-1.6-.6l-.1-.1a1.8 1.8 0 0 0-2-.3 1.8 1.8 0 0 0-1.1 1.7V22a2.2 2.2 0 0 1-4.4 0v-.2A1.8 1.8 0 0 0 7.3 20a1.8 1.8 0 0 0-2 .3l-.1.1a2.2 2.2 0 0 1-3.2-3.2l.1-.1a1.8 1.8 0 0 0 .3-2 1.8 1.8 0 0 0-1.7-1.1H2a2.2 2.2 0 0 1 0-4.4h.2A1.8 1.8 0 0 0 4 7.3a1.8 1.8 0 0 0-.3-2l-.1-.1A2.2 2.2 0 0 1 4.9 1.4a2.2 2.2 0 0 1 1.6.6l.1.1a1.8 1.8 0 0 0 2 .3 1.8 1.8 0 0 0 1.1-1.7V2a2.2 2.2 0 0 1 4.4 0v.2A1.8 1.8 0 0 0 16.7 4a1.8 1.8 0 0 0 2-.3l.1-.1A2.2 2.2 0 0 1 22 4.9a2.2 2.2 0 0 1-.6 1.6l-.1.1a1.8 1.8 0 0 0-.3 2 1.8 1.8 0 0 0 1.7 1.1H22a2.2 2.2 0 0 1 0 4.4h-.2a1.8 1.8 0 0 0-1.7 1.1Z"
                stroke="white"
                strokeWidth="1.5"
                opacity="0.9"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* 九宫格 + 底部卡片 */}
      <main className="px-2 pb-4 mt-2">
        <div className="rounded-[14px] bg-white border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-y divide-gray-200">
            {gridItems.map((it) => (
              <button
                key={it.label}
                type="button"
                className="h-[64px] flex flex-col items-center justify-center gap-1 bg-white"
                onClick={() => navigateGridUrl(it.url)}
              >
                <img
                  src={it.logo || 'https://dongdong-web3.oss-cn-hangzhou.aliyuncs.com/images/%E7%A7%AF%E5%88%86%E5%95%86%E5%9F%8E%EF%BC%8D%E7%BB%A7%E7%BB%AD%E5%85%91%E6%8D%A2%20%281%29.png'}
                  alt=""
                  className="w-[28px] h-[28px] object-contain"
                />
                <div className="text-[15px] font-bold text-black/90">{it.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 bg-white rounded-[14px] border border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              {/* 简化的以太坊 Logo 占位 */}
              <svg width="22" height="22" viewBox="0 0 256 256" aria-hidden="true">
                <path
                  d="M128 0 42 82l86 174 86-174L128 0Z"
                  fill="#6b7280"
                  opacity="0.9"
                />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-[18px] font-extrabold text-black">$2,159.49</div>
              <div className="text-[16px] font-extrabold text-[#ff4d4f]">-4.43%</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[18px] font-extrabold text-black/90">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 6h16v12H4V6Z"
                stroke="#6b7280"
                strokeWidth="2"
                opacity="0.85"
              />
              <path
                d="M9 6V4h6v2"
                stroke="#6b7280"
                strokeWidth="2"
                opacity="0.85"
              />
            </svg>
            <span className="text-[18px] font-bold text-black/90">0.309 Gwei</span>
          </div>
        </div>

        <div className="mt-3 bg-white rounded-[14px] border border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-extrabold text-[18px] text-[#ff6b00]">
              G
            </div>
            <div className="min-w-0">
              <div className="text-[16px] font-semibold text-black/90 truncate">
                www.google.com.hk
              </div>
              <div className="text-[12px] font-semibold text-black/55 mt-1">未连接</div>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-[14px] border border-gray-300"
            onClick={() => setShowChainSheet(true)}
          >
            <div className="w-6 h-6 rounded-full bg-[#2f7df6] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 2 2 22h20L12 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-[18px] font-semibold text-black/90">{chainName}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 9l6 6 6-6"
                stroke="#6b7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </main>

      <ChainSheet
        open={showChainSheet}
        currentChainId={chainId}
        networks={networks}
        onClose={() => setShowChainSheet(false)}
        onPick={(id) => void changeChain(id)}
      />
    </div>
  );
}


export default DashboardPage
