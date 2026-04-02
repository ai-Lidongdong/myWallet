import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AES, enc } from 'crypto-js';
import { Wallet } from 'ethers';
import { saveAs } from 'file-saver';
import { PasswordModal } from '../components/PasswordModal';
import { useWalletStore } from '../stores/wallet';

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 头像：深绿圆角方 + 浅黄绿书签形（底部 V 缺口） */
function AccountAvatar() {
  return (
    <div
      className="flex h-[72px] w-[72px] items-center justify-center rounded-[18px] bg-[#1e4d3d]"
      aria-hidden
    >
      <svg width="38" height="38" viewBox="0 0 36 36" fill="none">
        <path
          d="M9 7h18v21.5L18 22 9 28.5V7z"
          fill="#c8e6a0"
        />
      </svg>
    </div>
  );
}

function DetailRow({
  label,
  value,
  onRowClick,
}: {
  label: string;
  value: string;
  onRowClick?: () => void;
}) {
  const rowClass =
    'flex min-h-[52px] w-full items-center justify-between gap-3 border-b border-[#efefef] px-4 py-3 text-left last:border-b-0';
  const inner = (
    <>
      <span className="shrink-0 text-[15px] text-black">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5 text-right text-[15px] text-black">
        <span className="truncate">{value}</span>
        <ChevronRightIcon className="shrink-0 text-[#bbb]" />
      </span>
    </>
  );
  if (onRowClick) {
    return (
      <button
        type="button"
        className={`${rowClass} cursor-pointer bg-white hover:bg-black/[0.02]`}
        onClick={onRowClick}
      >
        {inner}
      </button>
    );
  }
  return <div className={rowClass}>{inner}</div>;
}

type PasswordModalMode = 'privateKey' | 'exportWallet';

export default function AccountDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const address = searchParams.get('address') ?? '';
  const [passwordModalMode, setPasswordModalMode] = useState<PasswordModalMode | null>(null);

  const account = useWalletStore((s) => s.getAccountByAddress(address));
  const verifyPassword = useWalletStore((s) => s.verifyPassword);
  const walletPassword = useWalletStore((s) => s.password);
  const displayName = account?.name ?? 'Account';

  const handleExport = useCallback(
    async (plainPassword: string) => {
      if (!account?.privateKey || !walletPassword) {
        alert('无法导出，请确认钱包已解锁');
        return;
      }
      try {
        const bytes = AES.decrypt(account.privateKey, walletPassword);
        const pk = bytes.toString(enc.Utf8);
        if (!pk) {
          alert('解密失败');
          return;
        }
        const wallet = new Wallet(pk);
        const json = await wallet.encrypt(plainPassword);
        const blob = new Blob([json], { type: 'application/json' });
        saveAs(blob, `keystore-${account.address}.json`);
        alert('导出成功！请妥善保管文件和密码');
      } catch {
        alert('导出失败');
      }
    },
    [account, walletPassword]
  );

  const passwordModalOpen = passwordModalMode !== null;
  const passwordModalTitle =
    passwordModalMode === 'exportWallet' ? '确认导出账户' : '验证密码以查看私钥';

  return (
    <div className="w-[360px] min-h-[540px] bg-[#f9f9f9] text-black">
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
        <h1 className="min-w-0 flex-1 truncate text-center text-[16px] font-semibold text-black">
          {displayName}
        </h1>
        <span className="w-10 shrink-0" aria-hidden />
      </header>

      <div className="flex justify-center pb-2 pt-4">
        <AccountAvatar />
      </div>

      <div className="flex flex-col gap-5 px-4 pb-6 pt-4">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
          <DetailRow label="Account name" value={displayName} />
          <DetailRow label="Networks" value="10 addresses" />
          <DetailRow
            label="展示秘钥"
            value="Unlock to reveal"
            onRowClick={() => setPasswordModalMode('privateKey')}
          />
          <DetailRow label="Smart Account" value="Set up" />
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
          <DetailRow
            label="导出账户为 JSON 文件"
            value=""
            onRowClick={() => setPasswordModalMode('exportWallet')}
          />
          <DetailRow label="Secret Recovery Phrase" value="Reveal" />
        </div>
      </div>

      <PasswordModal
        open={passwordModalOpen}
        title={passwordModalTitle}
        onClose={() => setPasswordModalMode(null)}
        onConfirm={async (password) => {
          if (!verifyPassword(password)) {
            alert('密码错误');
            return;
          }
          const mode = passwordModalMode;
          setPasswordModalMode(null);
          if (mode === 'privateKey') {
            navigate(`/private-key?address=${encodeURIComponent(address)}`);
          } else if (mode === 'exportWallet') {
            await handleExport(password);
          }
        }}
      />
    </div>
  );
}
