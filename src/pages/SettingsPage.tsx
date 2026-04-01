import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PasswordModal } from "../components/PasswordModal"
import { useWalletStore } from "../stores/wallet"

function SettingsPage() {
  const navigate = useNavigate()
  const { lockWallet, verifyPassword } = useWalletStore()
  const [phrasePasswordOpen, setPhrasePasswordOpen] = useState(false)

  const LockWallet = () => {
    lockWallet()
    window.location.hash = "#/unlock"
  }

  return (
    <section className="relative grid gap-3 px-1 text-center">
      <div className="relative flex min-h-[44px] items-center justify-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[20px] leading-none text-black/80 transition hover:bg-black/[0.06] active:bg-black/[0.1]"
          aria-label="返回">
          ←
        </button>
        <h2 className="m-0 px-10 text-base font-semibold">Settings Page</h2>
      </div>
      <p className="m-0 text-xs text-black/60">You can put extension settings here.</p>
      <button
        className="border border-black/15 px-3 py-2 text-xs font-medium text-black/80"
        onClick={LockWallet}>
        Lock Wallet
      </button>
      <button
        className="border border-black/15 px-3 py-2 text-xs font-medium text-black/80"
        onClick={() => setPhrasePasswordOpen(true)}>
        Reveal Phrase
      </button>

      <PasswordModal
        open={phrasePasswordOpen}
        title="验证密码以查看助记词"
        onClose={() => setPhrasePasswordOpen(false)}
        onConfirm={async (password) => {
          // 在此校验 password，例如与 store 比对；此处仅演示把密码交回页面
          const result = verifyPassword(password)
          if (!result) {
            alert("密码错误")
            return
          }
          setPhrasePasswordOpen(false)
          window.location.hash = "#/phrase"
        }}
      />
    </section>
  )
}

export default SettingsPage

