import { useState } from 'react'
import { addProduct } from './api'
import ecommerceAbi from '../../EcommercePayment.json'
import { ethers } from 'ethers'
import { BrowserProvider } from 'ethers'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
const USDT_ADDRESS = import.meta.env.VITE_USDT_ADDRESS
const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS

const erc20Abi = [
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
]

function Admin() {

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    stock: '',
    category: '',
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [withdrawForm, setWithdrawForm] = useState({
    tokenAddress: '',
    amount: '',
  });

  const [withdrawMessage, setWithdrawMessage] = useState('');


  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {

    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {

      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        images: form.image ? [form.image] : [],
        stock: Number(form.stock),
        category: form.category,
        variants: [],
      }

      await addProduct(payload)

      setMessage('Product added successfully')

      setForm({
        name: '',
        description: '',
        price: '',
        image: '',
        stock: '',
        category: '',
      })
    } catch (err) {
      setMessage(err.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }

  }

  const assertAddress = (value, label) => {

    if (!value) {
      throw new Error(`${label} is not configured. Please set it in frontend .env`)
    }

    return value
  }

  const handleWithdraw = async (e) => {
    e.preventDefault();

    setLoading(true);
    setWithdrawMessage('');

    try {
      const { ethereum } = window; // MetaMask injects the Ethereum object

      if (!ethereum) throw new Error('MetaMask not detected');

      await ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new BrowserProvider(ethereum);

      const signer = await provider.getSigner(); //who is the signer? 

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ecommerceAbi,
        signer
      );

      // const tokenAddress = tokenSymbol === 'USDT'
      //   ? assertAddress(USDT_ADDRESS, 'USDT address')
      //   : assertAddress(USDC_ADDRESS, 'USDC address')

      const tokenContract = new ethers.Contract(USDT_ADDRESS, erc20Abi, signer);

      // // check

      const decimals = await tokenContract.decimals();

      const contractBalance = await tokenContract.balanceOf(CONTRACT_ADDRESS);

      const amountToWithdraw = ethers.parseUnits(withdrawForm.amount, decimals);
      
      if (amountToWithdraw > contractBalance) {
        throw new Error('Insufficient token balance in the contract');
      }

      // check - done

      const tx = await contract.withdrawToken(
        withdrawForm.tokenAddress,
        ethers.parseUnits(withdrawForm.amount, decimals) // Adjust decimals as needed
      );

      await tx.wait();
      setWithdrawMessage('Withdrawal successful!');
      setWithdrawForm({ tokenAddress: '', amount: '' });
    } catch (err) {
      setWithdrawMessage(err.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawChange = (e) => {

    const { name, value } = e.target;
    setWithdrawForm((prev) => ({ ...prev, [name]: value }));

  };

  return (

    <>

      <div className="admin">

        <h2>Admin Panel</h2>

        <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
          Create new products that will appear on the main shop page.
        </p>

        <form className="admin-form" onSubmit={handleSubmit}>

          <div className="field">
            <label>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="field-inline">
            <div className="field">
              <label>Price (token units)</label>
              <input
                name="price"
                type="number"
                step="0.0001"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Stock</label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </div>

          </div>
          <div className="field">
            <label>Image URL</label>
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="add-to-cart" disabled={loading}>
            {loading ? 'Saving...' : 'Add Product'}
          </button>

          {message && (
            <p style={{ marginTop: '0.75rem', color: message.toLowerCase().includes('success') ? '#065f46' : '#dc2626' }}>{message}</p>
          )}

        </form>
      </div>

      {/* Withdraw form */}

      <div className="withdraw-section">

        <h3>Withdraw Tokens</h3>

        <form onSubmit={handleWithdraw}>

          <div className="field">

            <label>Token Address</label>

            <input
              name="tokenAddress"
              value={withdrawForm.tokenAddress}
              onChange={handleWithdrawChange}
              required
            />

          </div>

          <div className="field">

            <label>Amount</label>

            <input
              name="amount"
              type="number"
              step="0.0001"
              value={withdrawForm.amount}
              onChange={handleWithdrawChange}
              required
            />

          </div>

          <button type="submit" className="add-to-cart" disabled={loading}>
            {loading ? 'Processing...' : 'Withdraw'}
          </button>

          {withdrawMessage && <p style={{ marginTop: '0.75rem', color: withdrawMessage.toLowerCase().includes('success') ? '#065f46' : '#dc2626' }}>{withdrawMessage}</p>}

        </form>
      </div>


    </>
  )
}

export default Admin


