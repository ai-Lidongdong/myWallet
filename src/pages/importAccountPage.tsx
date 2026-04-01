import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../stores/wallet';

export default function ImportAccountPage() {
  const navigate = useNavigate();
  const importOtherAccountByPrivateKey = useWalletStore(
    (s) => s.importOtherAccountByPrivateKey
  );

  const [privateKey, setPrivateKey] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const goBack = () => navigate(-1);

  const canImport =
    privateKey.trim().length > 0 && !submitting;

  const handleImport = async () => {
    if (!canImport) return;
    setSubmitting(true);
    try {
      await importOtherAccountByPrivateKey(privateKey);
      goBack();
    } catch (e) {
      alert(e instanceof Error ? e.message : '导入失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[540px] w-[360px] flex-col bg-white text-black">
      <header className="flex shrink-0 items-center px-2 pb-1 pt-2">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center text-[#666] cursor-pointer"
          onClick={goBack}
          aria-label="返回"
          title="返回"
        >
          ‹
        </button>
        <span className="w-10 shrink-0" aria-hidden />
      </header>

      <div className="flex flex-1 flex-col px-5 pb-8 pt-2">
        <h1 className="text-center text-[22px] font-bold tracking-tight text-black">
          Add wallet
        </h1>

        <p className="mt-5 text-left text-[13px] leading-relaxed text-black/85">
          Imported accounts won&apos;t be associated with your wallet&apos;s Secret
          Recovery Phrase.{' '}
          <span className="font-medium text-[#2563eb] underline decoration-[#2563eb]/30">
            Learn more about imported accounts here
          </span>
        </p>

        <label
          htmlFor="import_private_key"
          className="mt-8 block text-[13px] font-medium text-black"
        >
          Enter your private key string here:
        </label>
        <input
          id="import_private_key"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder=""
          className="mt-2 w-full rounded-xl border border-black px-3 py-3 text-[15px] text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-2 focus:ring-black/10"
        />

        <div className="mt-10 flex gap-3">
          <button
            type="button"
            onClick={goBack}
            className="h-[48px] flex-1 rounded-full bg-black text-[15px] font-semibold text-white transition hover:bg-black/90 active:scale-[0.99]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canImport}
            onClick={() => void handleImport()}
            className={[
              'h-[48px] flex-1 rounded-full text-[15px] font-semibold transition',
              canImport
                ? 'bg-[#ff6b00] text-white hover:bg-[#e65f00] active:scale-[0.99]'
                : 'cursor-not-allowed bg-[#e8e8e8] text-[#9a9a9a]',
            ].join(' ')}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
