import React from 'react';
import { useNavigate } from 'react-router-dom';
import { shortAddr } from '../lib/address';
import type { WalletAccount } from '../stores/wallet';
import { useWalletStore } from '../stores/wallet';

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 9h10v10H9V9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


export default function AccountsPage() {
  const navigate = useNavigate();
  const { accounts, otherAccounts, currentAccount, createAccount, switchAccount } =
    useWalletStore();
  console.log('---accounts', accounts);

  const renderAccountRow = (addr: WalletAccount, rowKey: string) => {
    const selected = currentAccount?.address === addr.address;
    return (
      <div
        key={rowKey}
        className={[
          'group flex w-full min-h-[56px] items-stretch overflow-hidden rounded-[14px] border transition-colors',
          selected
            ? 'bg-[#fff2e8] border-[#ff6b00]/60'
            : 'bg-white border-transparent hover:border-[#ff6b00]/60 hover:bg-[#fff2e8]',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={() => handleAccountClick(addr.address)}
          className="flex min-w-0 flex-[3] items-center gap-2 py-3 pl-4 pr-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b00]/40"
        >
          {selected ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff6b00]">
              <CheckIcon />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-extrabold text-[#000]">{addr?.name}</div>
            <div className="mt-1 truncate text-[11.5px] font-semibold text-[#666]">
              {shortAddr(addr.address)}
            </div>
          </div>
        </button>

        <div
          className="my-2 w-px shrink-0 self-stretch bg-[#e5e7eb] group-hover:bg-[#ff6b00]/25"
          aria-hidden
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goAccountDetail(addr.address);
          }}
          className="flex min-w-0 flex-1 items-center justify-center py-3 outline-none transition-colors hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff6b00]/40"
          aria-label="账号详情"
          title="详情"
        >
          <ArrowRightIcon className="text-[#666] group-hover:text-[#ff6b00] transition-colors" />
        </button>
      </div>
    );
  };

  const back = () => {
    window.history.back();
  };

  // 账号点击占位：后续你再逐个加功能
  const handleAccountClick = (address: string) => {
    switchAccount(address)
    window.location.hash = '#/dashboard';
  };

  const goAccountDetail = (address: string) => {
    navigate(`/account-detail?address=${encodeURIComponent(address)}`);
  };
  const handleManageAddress = () => {};
  const handleAddAddress = () => {
    const result = createAccount('');
    console.log('result', result)
  };

  const copyToClipboard = async () => {
    if (!currentAccount) return;
    try {
      await navigator.clipboard.writeText(currentAccount.address);
    } catch {
      // Fallback：老环境 clipboard API 不可用时
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
    }
  };

  return (
    <div className="w-[360px] min-h-[540px] bg-[#f5f7fb] text-black">
      <header className="px-4 pt-2 pb-3 flex items-center justify-between">
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center text-[#666] cursor-pointer"
          onClick={back}
          aria-label="返回上一页"
          title="返回"
        >
          ←
        </button>

        <div className="flex-1 text-center text-[16px] font-extrabold text-black">当前地址</div>

        <button
          type="button"
          className="w-10 h-10 rounded-[12px] bg-white border border-[#ff6b00]/25 flex items-center justify-center cursor-pointer"
          onClick={() => void copyToClipboard()}
          aria-label="复制钱包地址"
          title="复制钱包"
        >
          <CopyIcon className="text-[#ff6b00]" />
        </button>
      </header>

      <main className="px-4 pb-24">
        <div className="flex items-center justify-end mb-3">
          <button
            type="button"
            className="flex items-center gap-2 text-[13px] font-semibold text-[#666] cursor-pointer"
            onClick={() => void handleManageAddress()}
          >
            管理地址
            <ArrowRightIcon className="text-[#666] w-[16px] h-[16px] shrink-0" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {accounts.length ? (
            accounts.map((addr, idx) => renderAccountRow(addr, `${addr.address}-hd-${idx}`))
          ) : (
            <div className="rounded-[14px] bg-white border border-[#e5e7eb] px-4 py-6 text-center text-[13px] font-semibold text-[#666]">
              暂无账号
            </div>
          )}
        </div>

        <button
          type="button"
          className="mt-4 w-full h-[54px] rounded-[16px] bg-white border border-[#e5e7eb] flex items-center justify-center gap-2 cursor-pointer"
          onClick={() => void handleAddAddress()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 5v14M5 12h14"
              stroke="#ff6b00"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[15px] font-extrabold text-[#ff6b00]">添加新地址</span>
        </button>

        {otherAccounts.length > 0 ? (
          <div className="mt-6">
            <h2 className="mb-3 text-[14px] font-extrabold text-black">私钥导入地址</h2>
            <div className="flex flex-col gap-3">
              {otherAccounts.map((addr, idx) =>
                renderAccountRow(addr, `${addr.address}-other-${idx}`)
              )}
            </div>
          </div>
        ) : null}
      </main>

      <div className="pointer-events-none fixed bottom-0 left-1/2 z-20 w-[360px] max-w-full -translate-x-1/2 border-t border-[#e5e7eb] bg-[#f5f7fb]/95 px-4 py-3 shadow-[0_-6px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate('/import-account')}
          className="pointer-events-auto flex h-[50px] w-full items-center justify-center rounded-[14px] border border-[#ff6b00]/35 bg-white text-[15px] font-extrabold text-[#ff6b00] transition hover:bg-[#fff2e8] active:scale-[0.99]"
        >
          导入地址
        </button>
      </div>
    </div>
  );
}

