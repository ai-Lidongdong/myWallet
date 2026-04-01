import React from "react"
import { LOGO } from "../constants"
import { Field } from "../components/Field"
import { fetchPost, fetchGet } from "../axios"
import { useWalletStore } from '../stores/wallet';

export default function SetupPage() {
  const [password, setPassword] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)
  const { createWallet } = useWalletStore();
  const [mnemonic, setMnemonic] = React.useState<string | null>('');
  const mnemonicWords = React.useMemo(
    () => (mnemonic ? mnemonic.trim().split(/\s+/).filter(Boolean) : []),
    [mnemonic]
  )

  const submit = async () => {
    setErr(null)
    setBusy(true)
    try {
      const { mnemonic: newMnemonic } = await createWallet(password);
      setMnemonic(newMnemonic);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "失败")
    } finally {

    }
  }

  const copyMnemonic = async () => {
    if (!mnemonic) return
    try {
      await navigator.clipboard.writeText(mnemonic)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = mnemonic
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-orange-50/90 to-white">
      <main className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <img
          src={LOGO}
          className="mx-auto h-14 w-14 shrink-0 object-contain"
          alt="logo"
        />
        {
          mnemonic ?
            <>
              <div>
                <div className="text-[28px] font-extrabold tracking-[0.2px] leading-tight">
                  您的助记词是：
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {mnemonicWords.map((word, index) => (
                    <div
                      key={`${word}-${index}`}
                      className="rounded-lg border border-orange-200 bg-orange-50/60 px-2 py-2 text-center text-[12px] font-medium text-orange-900 shadow-sm">
                      <span className="mr-1 text-[10px] text-orange-500">{index + 1}.</span>
                      {word}
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-orange-200 bg-orange-100/70 px-4 text-sm font-semibold text-orange-700 transition hover:bg-orange-200/70"
                    onClick={() => void copyMnemonic()}>
                    复制助记词
                  </button>
                </div>
                <div className="mt-4 text-[13px] leading-relaxed text-[#e85c2a]">请务必保存助记词，否则将无法恢复钱包</div>
                <button
                  type="button"
                  className="mt-3 inline-flex h-14 w-full items-center justify-center rounded-xl bg-orange-500 px-4 text-base font-semibold text-white shadow-sm transition hover:bg-orange-600 active:bg-orange-700"
                  onClick={() => {
                    window.location.hash = "#/dashboard"
                  }}>
                  进入钱包
                </button>
              </div>
            </> :
            <>
              <div className="mt-6 flex h-[44px] w-full shrink-0 gap-0 rounded-xl border border-gray-200/90 bg-gray-50/90 p-1">
                <button
                  type="button"
                  className="min-h-0 flex-1 rounded-lg bg-orange-500 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
                  onClick={() => void 0}>
                  创建
                </button>
                <button
                  type="button"
                  className="min-h-0 flex-1 rounded-lg text-sm font-medium text-gray-600 transition hover:bg-white/80 hover:text-gray-900"
                  onClick={() => {
                    window.location.hash = "#/import_wallet"
                  }}>
                  导入
                </button>
              </div>

              <div className="h-3 shrink-0" aria-hidden />

              <Field label="">
                <input
                  className="box-border w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 shadow-sm outline-none ring-0 transition placeholder:text-gray-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200/60"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码解锁"
                />
              </Field>

              {err ? (
                <div className="mt-2 text-center text-xs font-medium text-red-600">{err}</div>
              ) : null}

              <div className="mt-auto pt-6">
                <button
                  type="button"
                  className="inline-flex h-14 w-full items-center justify-center rounded-xl bg-orange-500 px-4 text-base font-semibold text-white shadow-sm transition hover:bg-orange-600 active:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={busy}
                  onClick={() => void submit()}>
                  {busy ? "处理中…" : "创建钱包"}
                </button>
              </div>
            </>
        }
      </main>
    </div>
  )
}
