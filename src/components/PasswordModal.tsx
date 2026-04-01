import { useEffect, useId, useState } from "react"

export type PasswordModalProps = {
  open: boolean
  /** 弹窗标题，由外部传入 */
  title: string
  onClose: () => void
  /** 点击确认后将当前输入的密码回传（由调用方决定是否校验、关窗等） */
  onConfirm: (password: string) => void | Promise<void>
  placeholder?: string
  confirmText?: string
}

export function PasswordModal({
  open,
  title,
  onClose,
  onConfirm,
  placeholder = "密码",
  confirmText = "确认",
}: PasswordModalProps) {
  const titleId = useId()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!open) {
      setPassword("")
      setShowPassword(false)
    }
  }, [open])

  if (!open) return null

  const handleConfirm = async () => {
    await Promise.resolve(onConfirm(password))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-[3px]"
        aria-label="关闭"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[300px] rounded-[22px] bg-white/95 p-6 shadow-[0_12px_48px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.06]"
        onClick={(e) => e.stopPropagation()}>
        <h2
          id={titleId}
          className="text-center text-[17px] font-semibold leading-snug tracking-[-0.02em] text-[#1c1c1e]">
          {title}
        </h2>

        <div className="relative mt-5">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={placeholder}
            autoComplete="current-password"
            className="w-full rounded-[14px] border border-black/[0.08] bg-[#f2f2f7] px-4 py-3.5 pr-12 text-[16px] text-[#1c1c1e] outline-none transition placeholder:text-[#8e8e93] focus:border-black/15 focus:bg-white focus:ring-2 focus:ring-black/[0.06]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#8e8e93] transition hover:bg-black/[0.05] hover:text-[#3a3a3c] active:scale-95"
            aria-label={showPassword ? "隐藏密码" : "显示密码"}
            title={showPassword ? "隐藏密码" : "显示密码"}>
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <button
          type="button"
          onClick={() => void handleConfirm()}
          className="mt-6 w-full rounded-[14px] bg-[#ff9500] py-3.5 text-[17px] font-semibold text-white shadow-sm transition hover:bg-[#e68600] active:scale-[0.99] active:opacity-95">
          {confirmText}
        </button>
      </div>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4 20 20M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.77 10.77 0 0 1 12 5c6.5 0 10 7 10 7a18.32 18.32 0 0 1-3.29 4.31M6.61 6.61A18.95 18.95 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 4.39-1"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}
