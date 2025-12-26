const { ethers } = require('ethers');
const contractABI = require('../EcommercePayment.json');

// Provider (read-only) backed contract. Server will not hold a private key.
// const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL, {
//   chainId: 56,
//   name: 'Binance Smart Chain Mainnet',
// });

const provider = new ethers.JsonRpcProvider(process.env.BSC_TESTNET_RPC_URL, {
  chainId: 97,
  name: 'bsc-testnet',
});


// Read-only contract instance connected to provider
const readContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  provider
);

// Factory: create a contract instance connected to any signer or provider.
function getContract(signerOrProvider) {
  if (!signerOrProvider) return readContract;
  return new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, signerOrProvider);
}

module.exports = {
  provider,
  readContract,
  getContract,
};