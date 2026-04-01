import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useWalletStore } from "../stores/wallet"

function PhrasePage() {
  const navigate = useNavigate()
  const { decryptMnemonic } = useWalletStore();
  const [tab, setTab] = useState<"text" | "qr">("text")
  const [words, setWords] = useState<string[]>([])

  useEffect(() => {
    const mnemonic = decryptMnemonic()
    console.log('hhh1', mnemonic);
    if (mnemonic) {
      setWords(mnemonic.trim().split(/\s+/).filter(Boolean))
    }
  }, [decryptMnemonic])

  const copyPhrase = async () => {  
    const text = words.join(" ")
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = text
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white px-4 pb-6 pt-4">
      <div className="relative flex min-h-[44px] items-center justify-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[20px] leading-none text-black/80 transition hover:bg-black/[0.06] active:bg-black/[0.1]"
          aria-label="返回">
          ←
        </button>
        <h1 className="pointer-events-none text-center text-[17px] font-bold leading-snug tracking-tight text-black px-10">
          Reveal Secret Recovery Phrase
        </h1>
      </div>

      <div className="mt-5 flex justify-center gap-16 border-b border-transparent">
        <button
          type="button"
          onClick={() => setTab("text")}
          className="relative pb-2 text-[15px] font-semibold text-black">
          Text
          {tab === "text" ? (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-black" aria-hidden />
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setTab("qr")}
          className="relative pb-2 text-[15px] font-semibold text-black">
          QR
          {tab === "qr" ? (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-black" aria-hidden />
          ) : null}
        </button>
      </div>

      {tab === "text" ? (
        <>
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {words.map((word, index) => (
              <div
                key={`${word}-${index}`}
                className="flex items-center justify-center rounded-2xl bg-zinc-600 px-2 py-3 text-center text-[13px] font-medium lowercase tracking-wide text-white shadow-sm">
                {word}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void copyPhrase()}
            className="mt-6 w-full text-center text-[15px] font-bold text-[#e85c2a] transition hover:text-[#d14e20] active:opacity-80">
            Copy to clipboard
          </button>
        </>
      ) : (
        <div className="mt-8 flex flex-1 flex-col items-center justify-center gap-3 text-sm text-black/50">
          <p>QR view</p>
          <p className="text-xs">（占位，可按需接入二维码）</p>
        </div>
      )}
    </div>
  )
}

export default PhrasePage
