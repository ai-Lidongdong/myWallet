import { Link } from "react-router-dom"

function HomePage() {
  return (
    <section className="grid gap-3 text-center">
      <Link
        to="/settings"
        className="inline-flex justify-center rounded border border-black/15 px-3 py-2 text-xs font-medium text-black/80">
        Go to Settings
      </Link>
      <Link
        to="/import_wallet"
        className="inline-flex justify-center rounded border border-black/15 px-3 py-2 text-xs font-medium text-black/80">
        Go to ImportWallet
      </Link>
      <Link
        to="/setup"
        className="inline-flex justify-center rounded border border-black/15 px-3 py-2 text-xs font-medium text-black/80">
        Go to SetUp
      </Link>
      <Link
        to="/dashboard"
        className="inline-flex justify-center rounded border border-black/15 px-3 py-2 text-xs font-medium text-black/80">
        Go to Dashboard
      </Link>
    </section>
    
  )
}

export default HomePage

