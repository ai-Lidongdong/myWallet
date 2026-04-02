import { useWalletStore } from '../stores/wallet';
import injectMyWallet from './injected-helper';
import * as constant from '../constants';
import { handleWalletRpcRequest } from '../services/walletRpcHandlers';

let walletStore;
const initWallet = () =>{
  console.log('background 初始化钱包状态');
  walletStore = useWalletStore.getState()
}

// 注入钱包脚本到页面
const setupScriptInjection = () => {
  // 当页面加载完成时注入
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log('开始注入-myWallet')
    if (changeInfo.status !== "complete") return
    const tryInject = (url: string | undefined) => {
      if (!url || url.startsWith("chrome://")) return
      chrome.scripting.executeScript(
        {
          target: { tabId },
          world: "MAIN",
          func: injectMyWallet
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error("background-myWallet 注入失败", chrome.runtime.lastError)
          } else {
            console.log("background-myWallet 注入完成")
          }
        }
      )
    }

    // 无 tabs / host_permissions 时，onUpdated 里的 tab 经常不带 url；需用 tabs.get 再取一次
    if (tab.url) {
      tryInject(tab.url)
    } else {
      chrome.tabs.get(tabId, (full) => {
        if (chrome.runtime.lastError) {
          console.warn("tabs.get 失败:", chrome.runtime.lastError.message)
          return
        }
        tryInject(full.url)
      })
    }
  })

  // 当标签页激活时也注入（备用机制）
  chrome.tabs.onActivated.addListener((e) => {
    chrome.tabs.get(e.tabId, (tab) => {
      if (tab.url && !tab.url.startsWith('chrome://')) {
    console.log('开始注入-myWallet')
        chrome.scripting.executeScript({
          target: { tabId: e.tabId },
          world: "MAIN",
          func: injectMyWallet
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("background-myWallet 注入失败", chrome.runtime.lastError)
          } else {
            console.log("background-myWallet 注入完成")
          }
        })  
      }
    })  
  })
}

// 注册消息监听器
const setupMessageListener = () => {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('background 收到消息:', message.type, '数据信息', message);
    if (message.type === constant.WALLET_JSON_RPC) {
      const method = message.data?.method as string;
      const params = (message.data?.params ?? []) as unknown[];
      void handleWalletRpcRequest(method, params).then((out) => {
        if (out.ok === false) {
          sendResponse({
            data: { error: out.error.message, code: out.error.code },
          });
          return;
        }
        sendResponse({ data: { result: out.result } });
      });
      return true;
    }

    sendResponse({
      data: { error: '未知消息类型' },
    });
    return true;
  });
};


initWallet()
setupScriptInjection()
setupMessageListener()
// 监听扩展安装事件
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 执行安装时的操作
    console.log('🔄 扩展安装完成');
  }
})
