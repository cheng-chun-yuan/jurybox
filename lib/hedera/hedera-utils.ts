// Real Hedera utility functions using MetaMask/Wagmi
import { transferHBARViaEVM } from './hedera-evm'

export interface HederaTransferResult {
  success: boolean
  transactionId?: string
  error?: string
  hashscanUrl?: string
}

export async function transferHBAR(
  toAccountId: string, 
  amount: number, 
  network: 'testnet' | 'mainnet' = 'testnet',
  fromEVMAddress?: string
): Promise<HederaTransferResult> {
  try {
    console.log(`Transferring ${amount} HBAR to ${toAccountId} on ${network}`)
    
    if (!fromEVMAddress) {
      return {
        success: false,
        error: 'EVM address is required for Hedera transfers with MetaMask'
      }
    }
    
    // Use Hedera EVM integration for real MetaMask transactions
    const result = await transferHBARViaEVM(toAccountId, amount, fromEVMAddress, network)
    
    return {
      success: result.success,
      transactionId: result.transactionHash,
      error: result.error,
      hashscanUrl: result.hashscanUrl
    }
  } catch (error) {
    console.error('Hedera transfer error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transfer failed'
    }
  }
}

export async function getAccountBalance(
  accountId: string, 
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{ balance: number; error?: string }> {
  try {
    console.log(`Getting balance for ${accountId} on ${network}`)
    
    // Use Hedera Mirror Node API to get balance
    const mirrorNodeUrl = network === 'testnet' 
      ? 'https://testnet.mirrornode.hedera.com/api/v1/accounts'
      : 'https://mainnet.mirrornode.hedera.com/api/v1/accounts'
    
    const response = await fetch(`${mirrorNodeUrl}/${accountId}/balance`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Convert from tinybars to HBAR
    const balanceInHbar = data.balance ? data.balance / 100000000 : 0
    
    console.log(`Account ${accountId} balance: ${balanceInHbar} HBAR`)
    
    return { balance: balanceInHbar }
  } catch (error) {
    console.error('Error getting account balance:', error)
    return {
      balance: 0,
      error: error instanceof Error ? error.message : 'Failed to get balance'
    }
  }
}

// Helper function to convert EVM address to Hedera Account ID
// This follows the official Hedera tutorial approach
export async function convertEVMToHederaAccount(
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

// Helper function to convert Hedera Account ID to EVM address
// This is needed for MetaMask transactions
export async function convertHederaAccountToEVM(
  accountId: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<string | null> {
  try {
    console.log(`Converting Hedera Account ID ${accountId} to EVM address`)

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

    // If Mirror Node doesn't have EVM address, try manual conversion
    console.log(`No EVM address found in Mirror Node for ${accountId}, trying manual conversion`)

    // Manual conversion using Hedera's account ID to EVM address algorithm
    const parts = accountId.split('.')
    if (parts.length === 3) {
      const shard = parseInt(parts[0])
      const realm = parseInt(parts[1])
      const account = parseInt(parts[2])

      if (!isNaN(shard) && !isNaN(realm) && !isNaN(account)) {
        // Create 20-byte buffer for EVM address
        // Format: 4 bytes shard + 8 bytes realm + 8 bytes account (last 8 bytes for account num)
        const buffer = Buffer.alloc(20)
        buffer.writeUInt32BE(shard, 0)
        buffer.writeBigUInt64BE(BigInt(realm), 4)
        buffer.writeBigUInt64BE(BigInt(account), 12)
        const evmAddress = '0x' + buffer.toString('hex')

        console.log(`Manually converted ${accountId} to EVM address: ${evmAddress}`)
        return evmAddress
      }
    }

    console.log(`Could not convert ${accountId} to EVM address`)
    return null
  } catch (error) {
    console.error('Error converting Hedera Account ID to EVM address:', error)
    return null
  }
}

// Helper function to convert receipt account ID to EVM address
// This is useful for processing transaction receipts
export async function convertReceiptAccountToEVM(
  receiptAccountId: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<string | null> {
  try {
    console.log(`Converting receipt account ID ${receiptAccountId} to EVM address`)

    // First try to get EVM address from Mirror Node API
    const mirrorNodeUrl = network === 'testnet'
      ? 'https://testnet.mirrornode.hedera.com/api/v1/accounts'
      : 'https://mainnet.mirrornode.hedera.com/api/v1/accounts'

    const response = await fetch(`${mirrorNodeUrl}/${receiptAccountId}`)

    if (response.ok) {
      const data = await response.json()

      if (data.evm_address) {
        console.log(`Converted receipt account ${receiptAccountId} to EVM address: ${data.evm_address}`)
        return data.evm_address
      }
    }

    // If Mirror Node doesn't have EVM address, try manual conversion
    // This is a fallback for accounts that might not have EVM addresses yet
    console.log(`No EVM address found in Mirror Node for ${receiptAccountId}, trying manual conversion`)

    // Manual conversion using Hedera's account ID to EVM address algorithm
    const parts = receiptAccountId.split('.')
    if (parts.length === 3) {
      const shard = parseInt(parts[0])
      const realm = parseInt(parts[1])
      const account = parseInt(parts[2])

      if (!isNaN(shard) && !isNaN(realm) && !isNaN(account)) {
        // Create 20-byte buffer for EVM address
        // Format: 4 bytes shard + 8 bytes realm + 8 bytes account (last 8 bytes for account num)
        const buffer = Buffer.alloc(20)
        buffer.writeUInt32BE(shard, 0)
        buffer.writeBigUInt64BE(BigInt(realm), 4)
        buffer.writeBigUInt64BE(BigInt(account), 12)
        const evmAddress = '0x' + buffer.toString('hex')

        console.log(`Manually converted ${receiptAccountId} to EVM address: ${evmAddress}`)
        return evmAddress
      }
    }

    console.log(`Could not convert receipt account ${receiptAccountId} to EVM address`)
    return null
  } catch (error) {
    console.error('Error converting receipt account ID to EVM address:', error)
    return null
  }
}