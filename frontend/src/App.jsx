import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Shop from './pages/Shop'
import Admin from './Admin'
import Header from './components/Header'

function App() {
  const [account, setAccount] = useState('')

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask not found. Please install it to continue.')
      return
    }
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      setAccount(accounts[0])
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="app">
      
      <Header account={account} onConnect={connectWallet} />

      <Routes>

        <Route
          path="/"
          element={<Shop account={account} onConnect={connectWallet} />}
        />

        <Route path="/admin" element={<Admin />} />

      </Routes>
    </div>
  )
}

export default App
