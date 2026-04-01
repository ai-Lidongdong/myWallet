export type PublicState = {
  hasWallet: boolean;
  isUnlocked: boolean;
  accounts: string[];
  selectedAccount: number;
  chainId: string;
};

export type NetworkItem = { chainId: string; name: string };

