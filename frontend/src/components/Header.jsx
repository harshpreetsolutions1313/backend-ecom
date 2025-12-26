import { Link, useLocation } from 'react-router-dom'

function Header({ account, onConnect }) {
  const location = useLocation()

  return (
    <header className="header">
      <h1>Ecommerce DApp</h1>
      <nav className="nav">
        <Link
          to="/"
          className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
        >
          Shop
        </Link>
      </nav>
      <div>
        <button onClick={onConnect}>
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
        </button>
      </div>
    </header>
  )
}

export default Header


