function TokenSelector({ selectedToken, onChange }) {
  return (
    <div className="token-switcher">
      <label>
        Pay with:
        <select
          value={selectedToken}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="USDT">USDT</option>
          <option value="USDC">USDC</option>
        </select>
      </label>
    </div>
  )
}

export default TokenSelector


