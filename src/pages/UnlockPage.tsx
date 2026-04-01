import React, { useState } from "react"
import { LOGO } from "../constants"
import { useWalletStore } from "../stores/wallet"

function UnlockPage() {
  const [password, setPassword] = useState("");
  const { unlockWallet } = useWalletStore()
  const submit = () =>{
    if (!password) return
    const unLocked = unlockWallet(password)
    setPassword("")
    if(unLocked) {
      window.location.href = "#/dashboard"
    }
  }
  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-[#f08c45] via-[#f4d1b2] to-white">
      <main className="flex flex-1 flex-col px-6 pb-5 pt-10">
        <img src={LOGO} alt="logo" className="mx-auto h-24 w-24 object-contain" />

        <h1 className="mt-4 text-center text-[26px] font-extrabold tracking-tight text-[#111827]">
          Rabby Wallet
        </h1>
        <p className="mt-2 text-center text-[14px] text-black/70">
          你首选的以太坊和 EVM 钱包
        </p>

        <div className="mt-10 rounded-2xl border border-black/10 bg-white/65 px-5 py-4 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset]">
          <input
            type="password"
            placeholder="输入密码解锁"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent text-[16px] text-[#333] outline-none placeholder:text-[#8b8b8b]"
          />
        </div>

        <button
          type="button"
          onClick={submit}
          className="mt-auto h-[52px] w-full rounded-2xl bg-[#ff6b00] text-[18px] font-extrabold tracking-[0.02em] text-white shadow-md transition hover:bg-[#ef6302] active:bg-[#de5b00]">
          解锁
        </button>

        <button
          type="button"
          className="mt-5 text-center text-[14px] font-medium text-black/70 transition hover:text-black/90">
          忘记密码？
        </button>
      </main>
    </div>
  )
}

export default UnlockPage

