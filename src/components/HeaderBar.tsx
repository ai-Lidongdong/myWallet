import React from 'react';
import type { NetworkItem } from '../types/wallet';

export function HeaderBar({
  chainId,
  networks,
  onOpenChain,
  onChangeChain,
  onOpenSettings,
}: {
  chainId: string;
  networks: NetworkItem[];
  onOpenChain: () => void;
  onChangeChain: (chainId: string) => void;
  onOpenSettings: () => void;
}) {
  return (
    <header className="topbar">
      <button className="icon_btn" onClick={onOpenChain} title="切换链">
        ⛓
      </button>

      <div className="topbar_mid">
        <div className="topbar_ttl">我的钱包</div>
      </div>

      <div className="topbar_r">
        <select
          className="net_sel"
          value={chainId}
          onChange={(e) => onChangeChain(e.target.value)}
          aria-label="网络切换"
        >
          {networks.map((n) => (
            <option key={n.chainId} value={n.chainId}>
              {n.name}
            </option>
          ))}
        </select>
        <button className="icon_btn" onClick={onOpenSettings} title="设置">
          ⚙
        </button>
      </div>
    </header>
  );
}

