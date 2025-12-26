import { useEffect, useState } from 'react'
import { fetchProducts, createOrder } from '../api'
import TokenSelector from '../components/TokenSelector'
import ProductGrid from '../components/ProductGrid'
import CategoryList from '../components/CategoryList'

function Shop({ account, onConnect }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingProductId, setProcessingProductId] = useState('')
  const [selectedToken, setSelectedToken] = useState('USDT')

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProducts()
        setProducts(data)
      } catch (err) {
        setError(err.message || 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleBuy = async (product) => {

    if (!account) {
      await onConnect()
      if (!account) return
    }

    setProcessingProductId(product.id)

    try {
      // Create and pay for order in one transaction on-chain
      const { createAndPayForOrderOnChain } = await import('../eth')

      const result = await createAndPayForOrderOnChain({
        productId: product.id,
        tokenSymbol: selectedToken,
        amount: product.price,
      })

      const { orderId, txHash } = result

      // Notify backend to track the order
      try {
        await createOrder({
          buyer: account,
          productId: product.id,
          amount: product.price,
          token: selectedToken,
          orderId: orderId,
          paid: true,
        })
      } catch (backendError) {
        console.warn('Failed to track order in backend:', backendError)
        // Don't fail the transaction if backend tracking fails
      }

      alert(
        `Payment successful!\nOrder ID: ${orderId}\nTx hash: ${txHash}`,
      )

    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to create order')
    } finally {
      setProcessingProductId('')
    }
  }

  return (
    <main>
      {loading && <p>Loading products...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <CategoryList />

      <TokenSelector
        selectedToken={selectedToken}
        onChange={setSelectedToken}
      />

      <ProductGrid
        products={products}
        selectedToken={selectedToken}
        processingProductId={processingProductId}
        onBuy={handleBuy}
        loading={loading}
      />

      <h1 class="underline">
        Hello world!
      </h1>

    </main>
  )
}

export default Shop


