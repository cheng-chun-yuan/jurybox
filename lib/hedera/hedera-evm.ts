// Hedera EVM integration for MetaMask compatibility
// This uses Hedera's EVM compatibility layer to work with MetaMask

import { convertReceiptAccountToEVM } from './hedera-utils'

export interface HederaEVMTransferResult {
  success: boolean
  transactionHash?: string
  error?: string
  hashscanUrl?: string
}

export async function transferHBARViaEVM(
  toAccountId: string,
  amount: number,
  fromEVMAddress: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<HederaEVMTransferResult> {
  try {
    console.log(`Transferring ${amount} HBAR to ${toAccountId} via EVM on ${network}`)
    
    // Hedera EVM network details
    const hederaEVMNetwork = {
      testnet: {
        chainId: '0x128', // 296 in hex
        rpcUrl: 'https://testnet.hashio.io/api',
        blockExplorer: 'https://hashscan.io/testnet'
      },
      mainnet: {
        chainId: '0x127', // 295 in hex  
        rpcUrl: 'https://mainnet.hashio.io/api',
        blockExplorer: 'https://hashscan.io/mainnet'
      }
    }
    
    const networkConfig = hederaEVMNetwork[network]
    
    // Check if user is connected to Hedera network
    if (typeof window !== 'undefined' && window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      
      if (chainId !== networkConfig.chainId) {
        // Request to switch to Hedera network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: networkConfig.chainId }],
          })
        } catch (switchError: any) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: networkConfig.chainId,
                chainName: `Hedera ${network === 'testnet' ? 'Testnet' : 'Mainnet'}`,
                rpcUrls: [networkConfig.rpcUrl],
                blockExplorerUrls: [networkConfig.blockExplorer],
                nativeCurrency: {
                  name: 'HBAR',
                  symbol: 'HBAR',
                  decimals: 18,
                },
              }],
            })
          } else {
            throw switchError
          }
        }
      }
    }
    
    // For Hedera EVM transfers, we need to:
    // 1. Convert Hedera Account ID to EVM address
    // 2. Use native HBAR transfer (Hedera supports native HBAR on EVM)
    // 3. MetaMask signs the transaction

    // Convert Hedera Account ID to EVM address
    const toEVMAddress = await convertHederaAccountToEVM(toAccountId, network)

    if (!toEVMAddress) {
      throw new Error('Could not convert Hedera Account ID to EVM address')
    }

    // Hedera EVM supports native HBAR transfers
    // Convert HBAR to wei (1 HBAR = 10^8 tinybars = 10^18 wei for EVM compatibility)
    // EVM uses 18 decimals, so multiply by 10^18
    const amountInWei = BigInt(Math.floor(amount * 1e8)) * BigInt(1e10)
    
    const transactionParameters = {
      to: toEVMAddress,
      from: fromEVMAddress,
      value: `0x${amountInWei.toString(16)}`, // Convert to hex
      gas: '0x5208', // 21000 gas limit for simple transfer
    }

    console.log('Requesting MetaMask transaction:', transactionParameters)
    console.log(`Transferring ${amount} HBAR (${amountInWei.toString()} wei) to ${toEVMAddress}`)
    
    // Request MetaMask to send the transaction
    const transactionHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    })
    
    console.log('Transaction submitted:', transactionHash)
    
    // Wait for transaction confirmation
    const receipt = await waitForTransactionConfirmation(transactionHash)
    
    if (receipt.status === '0x1') {
      const hashscanUrl = `${networkConfig.blockExplorer}/transaction/${transactionHash}`
      console.log('Transaction successful:', { transactionHash, hashscanUrl })
      
      return {
        success: true,
        transactionHash,
        hashscanUrl
      }
    } else {
      throw new Error('Transaction failed')
    }
    
  } catch (error) {
    console.error('Hedera EVM transfer error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transfer failed'
    }
  }
}

// Helper function to check if user is connected to Hedera network
export async function isConnectedToHederaNetwork(network: 'testnet' | 'mainnet' = 'testnet'): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false
  }
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' })
    const expectedChainId = network === 'testnet' ? '0x128' : '0x127'
    return chainId === expectedChainId
  } catch (error) {
    console.error('Error checking network:', error)
    return false
  }
}

// Helper function to convert Hedera Account ID to EVM address
// This follows the official Hedera tutorial approach
async function convertHederaAccountToEVM(
  accountId: string, 
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<string | null> {
  try {
    console.log(`Converting Hedera Account ID ${accountId} to EVM address`)
    
    // First try to get EVM address from Mirror Node API
    const mirrorNodeUrl = network === 'testnet' 
      ? 'https://testnet.mirrornode.hedera.com/api/v1/accounts'
      : 'https://mainnet.mirrornode.hedera.com/api/v1/accounts'
    
    const response = await fetch(`${mirrorNodeUrl}/${accountId}`)
    
    if (response.ok) {
      const data = await response.json()
      
      if (data.evm_address) {
        console.log(`Converted ${accountId} to EVM address: ${data.evm_address}`)
        return data.evm_address
      }
    }
    
    // If Mirror Node doesn't have EVM address, try to derive it
    // This is a fallback method for accounts that might not have EVM addresses yet
    console.log(`No EVM address found in Mirror Node for ${accountId}, this account may need to be activated for EVM`)
    
    return null
  } catch (error) {
    console.error('Error converting Hedera Account ID to EVM address:', error)
    return null
  }
}

// Helper function to convert EVM address to Hedera Account ID (reverse conversion)
async function convertEVMToHederaAccount(
  evmAddress: string, 
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<string | null> {
  try {
    console.log(`Converting EVM address ${evmAddress} to Hedera Account ID`)
    
    const mirrorNodeUrl = network === 'testnet' 
      ? 'https://testnet.mirrornode.hedera.com/api/v1/accounts'
      : 'https://mainnet.mirrornode.hedera.com/api/v1/accounts'
    
    const response = await fetch(`${mirrorNodeUrl}/${evmAddress}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.account) {
      console.log(`Converted ${evmAddress} to Hedera Account ID: ${data.account}`)
      return data.account
    }
    
    return null
  } catch (error) {
    console.error('Error converting EVM to Hedera account:', error)
    return null
  }
}

// Helper function to wait for transaction confirmation
async function waitForTransactionConfirmation(transactionHash: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const checkConfirmation = async () => {
      try {
        const receipt = await window.ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [transactionHash],
        })
        
        if (receipt) {
          resolve(receipt)
        } else {
          // Transaction not yet confirmed, check again in 2 seconds
          setTimeout(checkConfirmation, 2000)
        }
      } catch (error) {
        reject(error)
      }
    }
    
    checkConfirmation()
  })
}

// Helper function to process transaction receipt and convert account IDs to EVM addresses
export async function processTransactionReceipt(
  transactionHash: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{
  success: boolean;
  receipt?: any;
  fromEVMAddress?: string;
  toEVMAddress?: string;
  error?: string;
}> {
  try {
    console.log(`Processing transaction receipt for ${transactionHash}`)
    
    // Get transaction receipt from Hedera Mirror Node
    const mirrorNodeUrl = network === 'testnet' 
      ? 'https://testnet.mirrornode.hedera.com/api/v1/transactions'
      : 'https://mainnet.mirrornode.hedera.com/api/v1/transactions'
    
    const response = await fetch(`${mirrorNodeUrl}/${transactionHash}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.transactions || data.transactions.length === 0) {
      throw new Error('Transaction not found')
    }
    
    const transaction = data.transactions[0]
    const receipt = transaction.transaction
    
    // Convert account IDs to EVM addresses
    let fromEVMAddress: string | null = null
    let toEVMAddress: string | null = null
    
    if (receipt.account_id) {
      fromEVMAddress = await convertReceiptAccountToEVM(receipt.account_id, network)
    }
    
    if (receipt.transfers && receipt.transfers.length > 0) {
      // Find the recipient account ID from transfers
      const transfer = receipt.transfers.find((t: any) => t.amount > 0)
      if (transfer && transfer.account) {
        toEVMAddress = await convertReceiptAccountToEVM(transfer.account, network)
      }
    }
    
    console.log(`Processed receipt - From: ${fromEVMAddress}, To: ${toEVMAddress}`)
    
    return {
      success: true,
      receipt,
      fromEVMAddress: fromEVMAddress || undefined,
      toEVMAddress: toEVMAddress || undefined
    }
  } catch (error) {
    console.error('Error processing transaction receipt:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process receipt'
    }
  }
}

// Helper function to request network switch
export async function requestHederaNetwork(network: 'testnet' | 'mainnet' = 'testnet'): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false
  }
  
  const networkConfig = {
    testnet: {
      chainId: '0x128', // 296 in decimal
      chainName: 'Hedera Testnet',
      rpcUrls: ['https://testnet.hashio.io/api'], // Official Hedera JSON RPC Relay
      blockExplorerUrls: ['https://hashscan.io/testnet'],
      nativeCurrency: {
        name: 'HBAR',
        symbol: 'HBAR',
        decimals: 18,
      },
    },
    mainnet: {
      chainId: '0x127', // 295 in decimal
      chainName: 'Hedera Mainnet',
      rpcUrls: ['https://mainnet.hashio.io/api'], // Official Hedera JSON RPC Relay
      blockExplorerUrls: ['https://hashscan.io/mainnet'],
      nativeCurrency: {
        name: 'HBAR',
        symbol: 'HBAR',
        decimals: 18,
      },
    }
  }
  
  try {
    const config = networkConfig[network]
    
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: config.chainId }],
    })
    
    return true
  } catch (error: any) {
    if (error.code === 4902) {
      // Network doesn't exist, add it
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkConfig[network]],
        })
        return true
      } catch (addError) {
        console.error('Error adding Hedera network:', addError)
        return false
      }
    }
    
    console.error('Error switching to Hedera network:', error)
    return false
  }
}
