import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { randomBytes, ethers, Mnemonic, HDNodeWallet, Wallet } from 'ethers';
import { AES, SHA256, enc } from 'crypto-js';
import { fetchPost, fetchGet, fetchPut } from '../axios';
import { DEFAULT_NETWORKS, Network, type Token } from '../constants'

export interface WalletAccount {
    address: string;
    privateKey: string;
    name: string;
    index: number;
}


type WalletState = {
    networks: any;
    encryptWallet: any;
    isLocked: boolean;
    address: string | null;
    chainId: number | null;
    password: string | null;
    mnemonic: string | null;
    currentAccount: WalletAccount | null;
    accounts: WalletAccount[];
    /** 私钥导入的独立账号，结构与 accounts 一致，不参与 HD 派生 */
    otherAccounts: WalletAccount[];
    isConnected: boolean;
    currentNetwork: Network;
    tokens: Token[];
    createWallet: (password: string) => Promise<{ mnemonic?: string, success: boolean }>;
    importWallet: (phrase: string) => Promise<{ enRes: any, wallet: HDNodeWallet }>;
    importAccount: (mnemonic: string, wallet: HDNodeWallet, password: string, metaData: any) => Promise<any>;
    createAccount: (name?: string) => Promise<WalletAccount | boolean>;
    /**
     * 用私钥解析出地址并写入 otherAccounts；私钥经 AES 加密后与 accounts 一并写入 encryptWallet。
     * 成功返回新账号；校验错误抛错。
     */
    importOtherAccountByPrivateKey: (
        privateKeyInput: string
    ) => Promise<WalletAccount>;
    switchAccount: (address: string) => void;
    /** 按地址在 accounts 与 otherAccounts 中查找，返回完整账号信息；未找到返回 null */
    getAccountByAddress: (address: string) => WalletAccount | null;
    unlockWallet: (password: string) => boolean;
    lockWallet: () => void;
    // 拓展
    connect: () => Promise<WalletAccount>;
    signMessage: (message: string) => Promise<string>;
    disconnect: () => void;
    getProvider: () => ethers.JsonRpcProvider | null;
    addToken: (token: Token) => void;
    addNetwork: (network: Network) => void;
    switchNetwork: (networkId: string) => void;
    verifyPassword: (password: string) => boolean;
    decryptMnemonic: () => string | null;
};
/**
 * 加密钱包元数据
 * @param metadata - 元数据对象
 * @param address - 地址作为加密密钥的一部分（增加安全性）
 * @param userPassword - 用户密码（可选，额外保护层）
 */
const saveMetaData = async (address: string, metaData) => {
    return await fetchPost("/api/wallet/metadata", {
        address: address,
        encryptedMetadata: JSON.stringify(metaData)
    })
}
const onNewMnemonic = async (mnemonic: string, wallet: HDNodeWallet, password: string) => {
    const enPassword = SHA256(password).toString();
    const encryptedMnemonic = AES.encrypt(mnemonic, enPassword).toString();
    const encryptedPrivateKey = AES.encrypt(wallet.privateKey, enPassword).toString();
    const account: WalletAccount = {
        address: wallet.address,
        privateKey: encryptedPrivateKey,
        name: 'WalletName',
        index: 0
    };
    const accounts = [account];
    const walletListStr = JSON.stringify({
        accounts,
        mnemonic: encryptedMnemonic,
        otherAccounts: [],
    })
    const encryptWallet = AES.encrypt(walletListStr, enPassword).toString();
    const metaData = accounts.map((acc, idx) => ({
        index: acc.index,
        address: acc.address,
        name: acc.name,
        createdAt: Date.now()
    }));

    const res = await saveMetaData(account.address, metaData)
    if (!res) {
        return false
    }
    return {
        encryptWallet,
        isLocked: false,
        password: enPassword,
        currentAccount: account,
        accounts,
        mnemonic: encryptedMnemonic,
        otherAccounts: [],
    }

}
export const useWalletStore = create<WalletState>()(
    persist(
        (set, get) => ({
            encryptWallet: null,
            isLocked: true,
            address: null,
            chainId: null,
            currentAccount: null,
            mnemonic: null,
            accounts: [],
            otherAccounts: [],
            isConnected: false,
            password: null,
            currentNetwork: DEFAULT_NETWORKS[0],
            networks: DEFAULT_NETWORKS,
            tokens: [],
            createWallet: async (password: string) => {
                // 1. 生成随机助记词
                const entropy = randomBytes(16);
                const mnemonic = Mnemonic.fromEntropy(entropy);
                // 生成钱包
                const wallet = HDNodeWallet.fromPhrase(
                    mnemonic.phrase,
                    "",
                    "m/44'/60'/0'/0/0"
                );
                /* m / purpose' / coin_type' / account' / change / address_index
                m：主节点（由助记词生成的种子推导出的根节点）
                purpose'：表示币种类型：60 是 Ethereum（以太坊） 的注册索引
                account'：表示账户索引：0 表示第一个账户（用户可以切换不同账户）
                change：表示地址类型：0 表示外部接收地址（1 表示找零地址，以太坊通常只用 0）
                address_index：	表示该账户下的第 0 个地址（第一个地址）
                */
                const handleRes = await onNewMnemonic(
                    mnemonic.phrase,
                    wallet,
                    password
                )
                if (!handleRes) {
                    return { success: false }
                }
                set(handleRes)
                return { mnemonic: mnemonic.phrase, success: true }
            },
            // 通过助记词导入钱包
            importWallet: async (mnemonic: string) => {
                if (!Mnemonic.isValidMnemonic(mnemonic)) {
                    throw new Error('Invalid mnemonic phrase');
                }

                const derivationPath = "m/44'/60'/0'/0/0";
                const wallet = HDNodeWallet.fromPhrase(
                    mnemonic,
                    "",
                    derivationPath
                );
                const address = wallet.address
                const enRes: any = await fetchGet(`/api/wallet/metadata/${address}`, {
                    address,
                })
                return {
                    enRes,
                    wallet
                }
            },
            importAccount: async (mnemonic, wallet: any, password: string, metaData: any) => {
                if (!metaData) {
                    // 助记词在数据库没查到，当新的处理，只有一个新账号
                    const handleRes = await onNewMnemonic(mnemonic, wallet, password)

                    if (!handleRes) {
                        return { success: false }
                    }
                    set(handleRes)
                    return { mnemonic, success: true }
                }
                // 数据库发现有该第一个地址的记录，恢复该助记词所有账号
                const OldAccounts = JSON.parse(metaData.encryptedMetadata)
                const enPassword = SHA256(password).toString();
                const newMetaData = [];
                const accounts = []


                OldAccounts.forEach(item => {
                    const path = `m/44'/60'/${item.index}'/0/0`;
                    const itemWallet = HDNodeWallet.fromPhrase(mnemonic, "", path);
                    const encryptedPrivateKey = AES.encrypt(itemWallet.privateKey, enPassword).toString();
                    const meta = {
                        index: item.index,
                        address: item.address,
                        name: item.name,
                    }
                    newMetaData.push({
                        createdAt: Date.now(),
                        ...meta
                    })
                    accounts.push({
                        privateKey: encryptedPrivateKey,
                        ...meta
                    })
                })
                const encryptedMnemonic = AES.encrypt(mnemonic, enPassword).toString();
                const walletListStr = JSON.stringify({
                    accounts,
                    mnemonic: encryptedMnemonic,
                    otherAccounts: [],
                })
                const encryptWallet = AES.encrypt(walletListStr, enPassword).toString();
                set({
                    isLocked: false,
                    accounts: accounts,
                    otherAccounts: [],
                    currentAccount: accounts[0],
                    encryptWallet,
                    mnemonic: encryptedMnemonic,
                    password: enPassword,
                });
                return { success: true }
            },
            createAccount: async (name?: string) => {
                const { mnemonic, password: enPassword, accounts, otherAccounts = [] } = get()
                const { address } = accounts?.[0] || {}
                const enRes: any = await fetchGet(`/api/wallet/metadata/${address}`, {
                    address,
                })
                if (!mnemonic || !enPassword || !enRes) {
                    throw new Error('No wallet found');
                }
                const indexStr: string = (accounts[accounts.length - 1]?.index + 1).toString();

                const decryptedMnemonic = AES.decrypt(mnemonic, enPassword)
                const decrypted = decryptedMnemonic.toString(enc.Utf8);
                const derivationPath = "m/44'/60'/1'/0/0";
                const nextWallet = HDNodeWallet.fromPhrase(decrypted, "", derivationPath);

                const encryptedPrivateKey = AES.encrypt(nextWallet.privateKey, enPassword).toString();
                const newName = name ? name + indexStr : `Account ${Number(indexStr) + 1}`;
                const account: WalletAccount = {
                    address: nextWallet.address,
                    privateKey: encryptedPrivateKey,
                    name: newName,
                    index: Number(indexStr)
                };
                const newAccounts = [...accounts, { ...account }];
                const walletListStr = JSON.stringify({
                    accounts: newAccounts,
                    mnemonic,
                    otherAccounts,
                })
                const metaData = JSON.parse(enRes.encryptedMetadata)
                metaData.push({
                    index: indexStr,
                    address: nextWallet.address,
                    name: newName,
                    createdAt: Date.now()
                })

                const res = await fetchPut(`/api/wallet/metadata/${address}`, {
                    address,
                    encryptedMetadata: JSON.stringify(metaData)
                })
                if (!res) {
                    return false
                }
                const encryptWallet = AES.encrypt(walletListStr, enPassword).toString();
                set({
                    encryptWallet,
                    accounts: newAccounts
                });
                return account;
            },
            importOtherAccountByPrivateKey: async (privateKeyInput: string) => {
                const { mnemonic, password: enPassword, accounts, otherAccounts = [] } =
                    get();
                if (!mnemonic || !enPassword) {
                    throw new Error('未找到钱包，请先解锁');
                }
                const raw = privateKeyInput.trim();
                if (!raw) {
                    throw new Error('请输入私钥');
                }
                let wallet;
                try {
                    console.log('---raw', raw)
                    const hex = raw.startsWith('0x') ? raw : `0x${raw}`;
                    console.log('--hex', hex)
                    wallet = new Wallet(hex);
                    console.log('wallet', wallet);
                } catch {
                    throw new Error('私钥格式无效');
                }
                const norm = wallet.address.toLowerCase();
                const dupHd = accounts.some((a) => a.address.toLowerCase() === norm);
                const dupOther = otherAccounts.some(
                    (a) => a.address.toLowerCase() === norm
                );
                if (dupHd || dupOther) {
                    throw new Error('该地址已存在');
                }
                const nextIndex =
                    otherAccounts.length === 0
                        ? 0
                        : Math.max(...otherAccounts.map((a) => a.index)) + 1;
                const encryptedPrivateKey = AES.encrypt(
                    wallet.privateKey,
                    enPassword
                ).toString();
                const newName = `Imported ${wallet.address.slice(0, 6)}`;
                const account: WalletAccount = {
                    address: wallet.address,
                    privateKey: encryptedPrivateKey,
                    name: newName,
                    index: nextIndex,
                };
                const newOther = [...otherAccounts, account];
                const walletListStr = JSON.stringify({
                    accounts,
                    mnemonic,
                    otherAccounts: newOther,
                });
                const encryptWallet = AES.encrypt(
                    walletListStr,
                    enPassword
                ).toString();
                set({
                    encryptWallet,
                    otherAccounts: newOther,
                });
                return account;
            },
            lockWallet: () => {
                set({
                    mnemonic: null,
                    isLocked: true,
                    currentAccount: null,
                    accounts: [],
                    otherAccounts: [],
                });
                return true;
            },

            unlockWallet: (password: string) => {
                const state = get();
                const hashedPassword = SHA256(password).toString();
                if (state.password !== hashedPassword) {
                    return false
                }
                const decryptWalletStr = AES.decrypt(state.encryptWallet, hashedPassword)
                const decryptWallet = JSON.parse(decryptWalletStr.toString(enc.Utf8))
                const {
                    accounts,
                    mnemonic: encryptedMnemonic,
                    otherAccounts: loadedOther = [],
                } = decryptWallet
                set({
                    isLocked: false,
                    currentAccount: accounts[0],
                    accounts,
                    otherAccounts: Array.isArray(loadedOther) ? loadedOther : [],
                    mnemonic: encryptedMnemonic
                });
                return true;
            },
            switchAccount: (address: string) => {
                const { accounts, otherAccounts = [] } = get();
                const normalized = address.toLowerCase();
                const account =
                    accounts.find((acc) => acc.address.toLowerCase() === normalized) ??
                    otherAccounts.find((acc) => acc.address.toLowerCase() === normalized);
                if (account) {
                    set({ currentAccount: account });
                }
            },
            getAccountByAddress: (address: string) => {
                if (!address) return null;
                const { accounts, otherAccounts = [] } = get();
                const normalized = address.toLowerCase();
                return (
                    accounts.find((acc) => acc.address.toLowerCase() === normalized) ??
                    otherAccounts.find((acc) => acc.address.toLowerCase() === normalized) ??
                    null
                );
            },

            addNetwork: (network: Network) => {
                set(state => ({
                    networks: [...state.networks, network]
                }));
            },

            switchNetwork: (networkId: string) => {
                const state = get();
                const network = state.networks.find(net => net.id === networkId);
                if (network) {
                    set({ currentNetwork: network });
                }
            },
            getProvider: () => {
                const state = get();
                try {
                    return new ethers.JsonRpcProvider(state.currentNetwork.rpcUrl);
                } catch (error) {
                    console.error('Failed to create provider:', error);
                    return null;
                }
            },
            addToken: (token: Token) => {
                const state = get();
                set({
                    tokens: [...state.tokens.filter(t => t.address !== token.address), token]
                })
            },
            connect: async (): Promise<WalletAccount> => {
                const { isLocked, encryptWallet, currentAccount } = get();
                if (!encryptWallet) {   // 没有钱包账户
                    throw new Error('请先在插件中导入账户');
                }
                if (isLocked && !currentAccount && encryptWallet) { // 有账户但被锁定
                    throw new Error('请先解锁钱包账户');
                }
                set({
                    isConnected: true
                });

                return currentAccount;
            },
            disconnect: () => {
                set({
                    isConnected: false
                })
            },

            signMessage: async (message) => {
                const { isConnected, currentAccount, password } = get();
                if (!currentAccount || !isConnected) {
                    throw new Error('未连接钱包')
                }
                const bytes = AES.decrypt(currentAccount.privateKey, password);
                const privateKey = bytes.toString(enc.Utf8)

                const wallet = new Wallet(privateKey)
                return wallet.signMessage(message)
            },
            verifyPassword: (password: string) => {
                const state = get();
                const hashedPassword = SHA256(password).toString();
                return state.password === hashedPassword
            },
            decryptMnemonic: () => {
                const state = get();
                if (!state.mnemonic) {
                    return null
                }
                const bytes = AES.decrypt(state.mnemonic, state.password);
                return bytes.toString(enc.Utf8)
            }
        }),
        {
            name: 'wallet-storage', // 持久化连接状态（谨慎保存敏感信息！）
            storage: createJSONStorage(() => ({
                getItem: async (name: string) => {
                    const result = await chrome.storage.local.get(name);
                    return (result[name] as string | null) ?? null;
                },
                setItem: async (name: string, value: string) => {
                    await chrome.storage.local.set({ [name]: value });
                },
                removeItem: async (name: string) => {
                    await chrome.storage.local.remove(name);
                }
            })),
            partialize: (state): Partial<WalletState> => ({
                encryptWallet: state.encryptWallet,
                isLocked: state.isLocked,
                accounts: state.accounts,
                otherAccounts: state.otherAccounts,
                mnemonic: state.mnemonic,
                password: state.password,
                currentAccount: state.currentAccount,
                isConnected: state.isConnected
            })
        }
    )
);