import React from 'react';
import { useWalletStore } from '../stores/wallet';

export default function ImportWalletPage({ onDone }: { onDone: () => void }) {
  const { importWallet, importAccount } = useWalletStore();
  const [phrase, setPhrase] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [importPassword, setImportPassword] = React.useState('');
  const [newWallet, setNewWallet] = React.useState(null);
  const [metaData, setMetaData] = React.useState(null);

  const pastePhrase = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPhrase(text);
    } catch {
      /* 无剪贴板权限 */
    }
  };

  const back = () => {
    // 清空 hash，让 App 根据当前 state 回到 UnlockPage 或 SetupPage。
    window.location.hash = '';
  };

  const submit = async () => {
    setErr(null);
    setBusy(true);
    try {
      const { wallet, enRes } = await importWallet(phrase);
      setNewWallet(wallet)
      setMetaData(enRes)
    } catch (e) {
      setErr(e instanceof Error ? e.message : '失败');
    } finally {
      setBusy(false);
    }
  };
  const confirmPassword = async () => {
    const pwd = importPassword.trim()
    if (!pwd) return
    const { success } = await importAccount(
      phrase,
      newWallet,
      pwd,
      metaData,
    );
    if (!success) {
      return 
    }
    window.location.hash = "#/dashboard"
  }

  return (
    <>
      {
        !newWallet ?
          <div className="w-[360px] min-h-[540px] bg-[linear-gradient(180deg,_#e85c2a_0%,_#f5c4a0_50%,_#fff_50%,_#fff_100%)] text-[#1a1a1a]">
            <header className="px-5 pt-4 pb-2">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-white/25 border border-black/10 flex items-center justify-center text-[22px] leading-none cursor-pointer"
                  onClick={back}
                  title="返回"
                >
                  ←
                </button>

                <div className="min-w-0">
                  <div className="text-[28px] font-extrabold tracking-[0.2px] leading-tight">
                    导入钱包
                  </div>
                  <div className="mt-2 text-[13px] leading-relaxed text-black/70">
                    请输入您的私钥助记词。导入钱包将清除此设备上当前的钱包数据。此操作无法撤销。
                  </div>
                </div>
              </div>
            </header>

            <main className="px-4 pb-6 bg-white rounded-[20px_20px_0_0] pt-5 min-h-[50vh]">
              <div className="text-[14px]">
                <textarea
                  className="w-full h-[160px] px-4 py-4 rounded-[16px] border border-black/10 bg-white text-[#1a1a1a] outline-none resize-none"
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  placeholder="在每个单词之间添加一个空格，确保无人看到。"
                />

                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    className="text-[100%] font-bold text-[#e85c2a] leading-none cursor-pointer"
                    onClick={() => void pastePhrase()}
                  >
                    粘贴
                  </button>
                </div>

                {err ? (
                  <div className="mt-3 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 text-xs text-left">
                    {err}
                  </div>
                ) : null}

                <button
                  type="button"
                  className="mt-5 w-full h-12 rounded-[14px] border-0 bg-[#ff6b00] text-white font-bold text-[16px] disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={busy}
                  onClick={() => void submit()}
                >
                  {busy ? '处理中…' : '下一步'}
                </button>
              </div>
            </main>
          </div> :
          <div className="pt-10 flex min-h-full flex-col bg-[#f7f7f8] px-5 py-8">
            <label className="mb-2 text-sm font-medium text-black/80">设置新的钱包密码</label>
            <input
              type="password"
              value={importPassword}
              onChange={(e) => setImportPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete="new-password"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-[15px] text-[#1a1a1a] shadow-sm outline-none transition placeholder:text-black/35 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            />
            <button
              type="button"
              className="mt-5 w-full rounded-xl bg-[#ff6b00] py-3.5 text-[15px] font-semibold text-black shadow-sm transition hover:bg-[#f06000] active:bg-[#e55800]"
              onClick={confirmPassword}
            >
              确认
            </button>
          </div>
      }
    </>
  );
}

