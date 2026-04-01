import { useEffect, useMemo, useState } from "react"
import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import "./styles/globals.css"
import HomePage from "./pages/HomePage"
import SettingsPage from "./pages/SettingsPage"
import ImportWalletPage from "./pages/ImportWalletPage"
import SetupPage from "./pages/SetupPage";
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage'
import UnlockPage from "./pages/UnlockPage"
import PhrasePage from "./pages/PhrasePage"
import AccountDetailPage from "./pages/AccountDetailPage"
import PrivateKeyPage from "./pages/PrivateKeyPage"
import ImportAccountPage from "./pages/importAccountPage"
import { useWalletStore } from "./stores/wallet"

function IndexPopup() {
  const encryptWallet = useWalletStore((state) => state.encryptWallet);
  const isLocked = useWalletStore((state) => state.isLocked)
  const [hydrated, setHydrated] = useState(() => useWalletStore.persist.hasHydrated())
  useEffect(() => {
    const unsubscribe = useWalletStore.persist.onFinishHydration(() => {
      setHydrated((prev) => (prev ? prev : true))
    })
    return unsubscribe
  }, [])

  if (!hydrated) {
    return (
      <main className="h-[500px] w-[360px] grid place-items-center bg-white border border-black/10">
        <span className="text-sm text-black/60">加载中...</span>
      </main>
    )
  }

  return (
    <HashRouter>
      <main className="h-[500px] w-[360px] bg-white border border-black/10">
        <Routes>
          <Route path="/" element={<Navigate to={isLocked ? "/setup" : "/dashboard"} replace />} />
          <Route path="/dashboard" element={isLocked ? <Navigate to="/setup" replace /> : <DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="/import_wallet"
            element={<ImportWalletPage onDone={() => (window.location.hash = "#/home")} />}
          />
          <Route path="/setup" element={(encryptWallet && isLocked) ? <Navigate to="/unlock" replace /> : <SetupPage />} />
          <Route path="/unlock" element={<UnlockPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/phrase" element={<PhrasePage />} />
          <Route path="/account-detail" element={<AccountDetailPage />} />
          <Route path="/private-key" element={<PrivateKeyPage />} />
          <Route path="/import-account" element={<ImportAccountPage />} />
        </Routes>
      </main>
    </HashRouter>
  )
}

export default IndexPopup
