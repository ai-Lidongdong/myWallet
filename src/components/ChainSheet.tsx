import React from 'react';
import type { NetworkItem } from '../types/wallet';

export function ChainSheet({
  open,
  currentChainId,
  networks,
  onClose,
  onPick,
}: {
  open: boolean;
  currentChainId: string;
  networks: NetworkItem[];
  onClose: () => void;
  onPick: (chainId: string) => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-[#333333]/40 flex justify-center items-end"
      onClick={onClose}
    >
      <div
        className="w-[360px] rounded-t-[18px] bg-white overflow-hidden max-h-[78vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[54px] px-3 flex items-center justify-between border-b border-[#333333]/40">
          <div className="font-black text-[14px] text-[#333]">切换链</div>

          <button
            className="w-9 h-9 rounded-[12px] border border-[#f67907] text-[#f67907] bg-white/60 flex items-center justify-center cursor-pointer"
            onClick={onClose}
            type="button"
            title="关闭"
          >
            <span className="text-[16px] leading-none">✕</span>
          </button>
        </div>

        <div className="p-3 flex flex-col gap-2">
          {networks.map((n) => {
            const on = n.chainId === currentChainId;
            return (
              <button
                key={n.chainId}
                type="button"
                className={[
                  'text-left p-3 rounded-[14px] border cursor-pointer',
                  'bg-white',
                  on
                    ? 'border-2 border-[#f67907] bg-[#f67907]/10'
                    : 'border-[#d1d5db] border-1',
                ].join(' ')}
                onClick={() => onPick(n.chainId)}
              >
                <div className="font-black text-[13px] text-[#333]">{n.name}</div>
                <div className="mt-1 text-[12px] text-[#333]/70">{n.chainId}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

