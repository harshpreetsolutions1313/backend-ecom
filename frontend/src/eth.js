import { BrowserProvider, Contract, parseUnits } from 'ethers'
import ecommerceAbi from '../../EcommercePayment.json'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
const USDT_ADDRESS = import.meta.env.VITE_USDT_ADDRESS
const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS

function assertAddress(value, label) {
  if (!value) {
    throw new Error(`${label} is not configured. Please set it in frontend .env`)
  }
  return value
}

// Minimal ERC20 ABI: balanceOf, allowance, approve, decimals
const erc20Abi = [
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
]

export async function getProviderAndSigner() {

  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }

  const provider = new BrowserProvider(window.ethereum)

  const signer = await provider.getSigner()

  const network = await provider.getNetwork()

  if (Number(network.chainId) !== 56) {

    throw new Error('Please switch MetaMask to BSC Testnet (chainId 56)')

  }

  return { provider, signer }
}

// New function: Create and pay for order in one transaction
export async function createAndPayForOrderOnChain({ productId, tokenSymbol, amount }) {

  const { signer } = await getProviderAndSigner()

  const contractAddress = assertAddress(CONTRACT_ADDRESS, 'Contract address')

  const tokenAddress = tokenSymbol === 'USDT'
    ? assertAddress(USDT_ADDRESS, 'USDT address')
    : assertAddress(USDC_ADDRESS, 'USDC address')

  // Instantiate payment contract
  const contract = new Contract(contractAddress, ecommerceAbi, signer)

  // Check balance & allowance on token
  const user = await signer.getAddress()

  const tokenContract = new Contract(tokenAddress, erc20Abi, signer)

  // Get token decimals dynamically
  let decimals = 18

  try {

    decimals = await tokenContract.decimals()

  } catch (error) {

    console.warn('Failed to fetch token decimals, using default 18:', error)

  }

  // From the UI we treat price as "whole tokens"

  const amountWei = parseUnits(amount.toString(), decimals)

  const balance = await tokenContract.balanceOf(user)

  if (balance < amountWei) {

    throw new Error('Insufficient token balance for this purchase')

  }

  const allowance = await tokenContract.allowance(user, contractAddress)

  if (allowance < amountWei) {

    const approveTx = await tokenContract.approve(contractAddress, amountWei)

    await approveTx.wait()
  }

  // Create and pay for order in one transaction
  const tx = await contract.createAndPayForOrder(productId, amountWei, tokenAddress)

  const receipt = await tx.wait()

  // Extract orderId from PaymentReceived event
  const paymentReceivedEvent = receipt.logs
    .map(log => {

      try {

        return contract.interface.parseLog(log)

      } catch {

        return null

      }
    })
    .find(event => event && event.name === 'PaymentReceived')

  if (!paymentReceivedEvent) {

    throw new Error('PaymentReceived event not found in transaction receipt')

  }

  const orderId = paymentReceivedEvent.args.orderId

  return {

    orderId: orderId.toString(),

    txHash: receipt.hash

  }

}

// Keep old function for backward compatibility
export async function payForOrderOnChain({ orderId, tokenSymbol, amount }) {
  const { signer } = await getProviderAndSigner()

  const contractAddress = assertAddress(CONTRACT_ADDRESS, 'Contract address')
  const tokenAddress = tokenSymbol === 'USDT'
    ? assertAddress(USDT_ADDRESS, 'USDT address')
    : assertAddress(USDC_ADDRESS, 'USDC address')

  // Instantiate payment contract
  const contract = new Contract(contractAddress, ecommerceAbi, signer)

  // Check balance & allowance on token
  const user = await signer.getAddress()
  const tokenContract = new Contract(tokenAddress, erc20Abi, signer)

  // Get token decimals dynamically
  let decimals = 18 // Default to 18
  try {
    decimals = await tokenContract.decimals()
  } catch (error) {
    console.warn('Failed to fetch token decimals, using default 18:', error)
  }

  // From the UI we treat price as "whole tokens"
  const amountWei = parseUnits(amount.toString(), decimals)

  const balance = await tokenContract.balanceOf(user)
  if (balance < amountWei) {
    throw new Error('Insufficient token balance for this purchase')
  }

  const allowance = await tokenContract.allowance(user, contractAddress)
  if (allowance < amountWei) {
    const approveTx = await tokenContract.approve(contractAddress, amountWei)
    await approveTx.wait()
  }

  const tx = await contract.payForOrder(orderId, tokenAddress, amountWei)
  const receipt = await tx.wait()

  return {
    txHash: receipt.hash,
  }
}


