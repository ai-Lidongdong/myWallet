import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AES, enc } from 'crypto-js';
import { shortAddr } from '../lib/address';
import { useWalletStore } from '../stores/wallet';

function WarningBannerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M12 4 20 18H4L12 4Z" fill="white" />
      <path
        d="M12 9v5M12 17h.01"
        stroke="#b91c1c"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 黑底圆角方 + 白色以太坊菱形 */
function EthereumMark({ className }: { className?: string }) {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black ${className ?? ''}`}
      aria-hidden
    >
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
        <path d="M16 4 8 16l8 4 8-4-8-12Z" fill="white" fillOpacity="0.95" />
        <path d="M8 16 16 28l8-12-8 4-8-4Z" fill="white" fillOpacity="0.75" />
      </svg>
    </div>
  );
}

/** 叠卡 + 斜线，示意复制私钥 */
function CopyKeyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="5" y="7" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="9" y="5" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M7 19 17 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export default function PrivateKeyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const address = searchParams.get('address') ?? '';

  const account = useWalletStore((s) => s.getAccountByAddress(address));
  const walletPassword = useWalletStore((s) => s.password);

  const displayName = account?.name ?? 'Account';
  const [toastText, setToastText] = useState<string | null>(null);

  useEffect(() => {
    if (!toastText) return;
    const timer = window.setTimeout(() => setToastText(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toastText]);

  const copyPrivateKey = async () => {
    if (!account?.privateKey || !walletPassword) {
      return;
    }
    try {
      const bytes = AES.decrypt(account.privateKey, walletPassword);
      const pk = bytes.toString(enc.Utf8);
      if (!pk) {
        alert('解密失败，请确认钱包已解锁');
        return;
      }
      let copied = false;
      try {
        await navigator.clipboard.writeText(pk);
        copied = true;
      } catch {
        const ta = document.createElement('textarea');
        ta.value = pk;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        copied = document.execCommand('copy');
        document.body.removeChild(ta);
      }
      if (copied) {
        setToastText('私钥已复制到剪贴板');
      } else {
        alert('复制失败');
      }
    } catch {
      alert('复制失败');
    }
  };

  if (!account) {
    return (
      <div className="flex w-[360px] min-h-[540px] flex-col bg-white px-4 py-6 text-black">
        <p className="text-sm text-[#666]">未找到该地址对应的账号</p>
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-[#ff6b00]"
          onClick={() => navigate(-1)}
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="w-[360px] min-h-[540px] bg-white text-black">
      <header className="flex items-center px-2 pb-2 pt-2">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center text-[#666] cursor-pointer"
          onClick={() => navigate(-1)}
          aria-label="返回"
          title="返回"
        >
          ‹
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-[15px] font-semibold text-black">
          {displayName} / Private keys
        </h1>
        <span className="w-10 shrink-0" aria-hidden />
      </header>

      <div className="px-4 pt-2">
        <div className="flex gap-3 rounded-2xl bg-[#ffe8e8] px-3.5 py-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e85d5d]">
            <WarningBannerIcon />
          </div>
          <div className="min-w-0 flex-1 text-[13px] leading-snug text-black">
            <p className="m-0 font-bold">Don&apos;t share your private key</p>
            <p className="mt-1.5 m-0 text-[12.5px] text-black/90">
              This key grants full control of your account for the associated chain.{' '}
              <span className="font-medium text-[#2563eb] underline decoration-[#2563eb]/40">
                Learn more
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-8">
        <div className="flex items-center gap-3 py-2">
          <EthereumMark />
          <div className="min-w-0 flex-1">
            <div className="text-[16px] font-bold text-black">Ethereum</div>
            <div className="mt-0.5 text-[13px] font-medium text-[#888]">
              {shortAddr(account.address)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void copyPrivateKey()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-white text-[#333] shadow-sm transition hover:bg-black/[0.03] active:scale-[0.98]"
            aria-label="复制私钥"
            title="复制私钥"
          >
            <CopyKeyIcon />
          </button>
        </div>
      </div>

      {toastText ? (
        <div
          className="pointer-events-none fixed bottom-6 left-1/2 z-[200] max-w-[280px] -translate-x-1/2 rounded-full bg-[#1c1c1e]/92 px-4 py-2.5 text-center text-[13px] font-medium text-black shadow-lg ring-1 ring-white/10"
          role="status"
        >
          {toastText}
        </div>
      ) : null}
    </div>
  );
}
