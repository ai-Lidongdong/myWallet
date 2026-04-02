import { useWalletStore } from '../stores/wallet';
import injectMyWallet from './injected-helper';
import * as constant from "../constants";

let walletStore;
const initWallet = () =>{
  console.log('background 初始化钱包状态');
  walletStore = useWalletStore.getState()
}

// 注入钱包脚本到页面
const setupScriptInjection = () => {
  console.log('setupScriptInjection');
  // 当页面加载完成时注入
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete") return
    const tryInject = (url: string | undefined) => {
      if (!url || url.startsWith("chrome://")) return
      console.log("🔄 页面加载完成，开始注入 myWallet:", url)
      chrome.scripting.executeScript(
        {
          target: { tabId },
          world: "MAIN",
          func: injectMyWallet
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error("❌ Background script: 注入失败", chrome.runtime.lastError)
          } else {
            console.log("✅ Background script: myWallet 注入完成")
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
        console.log("🔄 标签页激活，注入 myWallet:", tab.url)
        chrome.scripting.executeScript({
          target: { tabId: e.tabId },
          world: "MAIN",
          func: injectMyWallet
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("❌ Background script: 注入失败", chrome.runtime.lastError)
          } else {
            console.log("✅ Background script: myWallet 注入完成1")
          }
        })  
      }
    })  
  })
}

// 注册消息监听器
const setupMessageListener = () => {
  console.log('background监听来自message-bridge 的消息已注册');
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("background 收到消息:", message.type, "数据信息", message);
    // 处理连接请求
    if (message.type === constant.WALLET_CONNECT) {
      const walletStore = useWalletStore.getState()
      try {
        walletStore.connect().then((account) => {
          console.log('222', account);
          sendResponse({
            data: { account }
          })
        }).catch((error) => {
          sendResponse({
            data: { error: error.message },
          })
        })
      } catch (error) {
        sendResponse({
          data: { error: error instanceof Error ? error.message : '连接失败' },
        })
      }
      return true
    }

    // 获取账号请求
    if (message.type === constant.WALLET_GET_ACCOUNT) {
      const walletStore = useWalletStore.getState()
      const account = walletStore.currentAccount
      sendResponse({
        data: { account }
      })
      return true
    }
  
    // 处理签名
    if (message.type === constant.WALLET_SIGN_MESSAGE) {
      if (!message.data || !message.data.message) {
        sendResponse({
          data: { error: '缺少签名信息' },
        })
        return true 
      }
      const walletStore = useWalletStore.getState()
      try {
        walletStore.signMessage(message.data.message)
        .then((signedMessage) => {
          sendResponse({
            data: { signedMessage }
          })
        })
        .catch((error) => {
          sendResponse({
            data: { error: error.message },
          })
        })
      } catch (error) {
        sendResponse({
          data: { error: error instanceof Error ? error.message : '签名失败' },
        })
      }
      return true
    }

    // 处理断开连接
    if (message.type === constant.WALLET_DISCONNECT) {
      const walletStore = useWalletStore.getState()
      walletStore.disconnect()
      sendResponse({
        data: { success: true }
      })
      return true
    }

    // 未知类型消息
    sendResponse({
      data: { error: '未知消息类型' },
    })
    return true
  })
}


initWallet()
setupScriptInjection()
setupMessageListener()
// 监听扩展安装事件
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🔄 扩展安装事件:', details.reason);
  if (details.reason === 'install') {
    // 执行安装时的操作
    console.log('🔄 扩展安装完成');
  }
})
