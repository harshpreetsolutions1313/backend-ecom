function ProductGrid({
  products,
  selectedToken,
  processingProductId,
  onBuy,
  loading,
}) {
  return (
    <div className="products">
      {products.map((product) => (
        <article key={product.id} className="product-card">
          <div className="card-media">
            {/* badges: sale, new, best */}
            {product.badge && <span className={`badge badge-${product.badge.toLowerCase()}`}>{product.badge}</span>}
            <div className="image-wrap">
              {product.images && product.images[0] ? (
                <img src={product.images[0]} alt={product.name} />
              ) : (
                <div className="image-placeholder" />
              )}
            </div>
          </div>

          <div className="card-body">
            <h3 className="product-title">{product.name}</h3>
            <div className="product-seller">{product.seller }</div>

            <div className="product-bottom">
              <div className="price-row">
                <div className="price-current">{product.price} <span className="token">{selectedToken}</span></div>
                {product.oldPrice && <div className="price-old">{product.oldPrice}</div>}
              </div>

              <div className="meta-row">
                <div className="rating">{product.rating || '4.8'} <span className="stars">★</span></div>
              </div>

              <button
                className="add-to-cart"
                onClick={() => onBuy(product)}
                disabled={processingProductId === product.id}
              >
                {processingProductId === product.id ? 'Processing...' : 'Add To Cart'}
              </button>
            </div>
          </div>
        </article>
      ))}

      {!loading && !products.length && <p>No products found.</p>}
    </div>
  )
}

export default ProductGrid


