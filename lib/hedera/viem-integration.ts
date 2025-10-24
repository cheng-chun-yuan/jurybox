/**
 * Hedera Integration using viem
 * Provides EVM-compatible Hedera operations for Privy integration
 */

import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient } from 'viem'
import { hederaTestnet } from 'viem/chains'

export interface HederaAccount {
  address: string
  balance: bigint
  nonce: number
}

export interface HederaTransaction {
  hash: string
  type: 'transfer' | 'contract_call' | 'contract_deploy'
  from: string
  to?: string
  value?: bigint
  data?: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
}

class HederaViemIntegration {
  private publicClient: PublicClient
  private walletClient: WalletClient | null = null
  private chain = hederaTestnet

  constructor() {
    // Create public client for read operations
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(),
    })
  }

  /**
   * Set wallet client for write operations
   */
  setWalletClient(walletClient: WalletClient) {
    this.walletClient = walletClient
  }

  /**
   * Get account balance in HBAR
   */
  async getBalance(address: `0x${string}`): Promise<bigint> {
    try {
      const balance = await this.publicClient.getBalance({ address })
      return balance
    } catch (error) {
      console.error('Failed to get balance:', error)
      throw error
    }
  }

  /**
   * Get account nonce
   */
  async getNonce(address: `0x${string}`): Promise<number> {
    try {
      const nonce = await this.publicClient.getTransactionCount({ address })
      return nonce
    } catch (error) {
      console.error('Failed to get nonce:', error)
      throw error
    }
  }

  /**
   * Get account information
   */
  async getAccount(address: `0x${string}`): Promise<HederaAccount> {
    try {
      const [balance, nonce] = await Promise.all([
        this.getBalance(address),
        this.getNonce(address)
      ])

      return {
        address,
        balance,
        nonce
      }
    } catch (error) {
      console.error('Failed to get account info:', error)
      throw error
    }
  }

  /**
   * Transfer HBAR between accounts
   */
  async transferHBAR(
    from: `0x${string}`,
    to: `0x${string}`,
    amount: bigint
  ): Promise<HederaTransaction> {
    if (!this.walletClient) {
      throw new Error('Wallet client not set. Call setWalletClient() first.')
    }

    try {
      const hash = await this.walletClient.sendTransaction({
        to,
        value: amount,
        account: from,
      })

      const transaction: HederaTransaction = {
        hash,
        type: 'transfer',
        from,
        to,
        value: amount,
        timestamp: Date.now(),
        status: 'pending'
      }

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash })
      
      transaction.status = receipt.status === 'success' ? 'confirmed' : 'failed'
      
      console.log(`✅ HBAR transfer completed: ${amount} wei from ${from} to ${to}`)
      return transaction
    } catch (error) {
      console.error('Failed to transfer HBAR:', error)
      throw error
    }
  }

  /**
   * Call a smart contract function
   */
  async callContract(
    contractAddress: `0x${string}`,
    functionName: string,
    args: any[],
    from: `0x${string}`,
    value?: bigint
  ): Promise<HederaTransaction> {
    if (!this.walletClient) {
      throw new Error('Wallet client not set. Call setWalletClient() first.')
    }

    try {
      const hash = await this.walletClient.writeContract({
        address: contractAddress,
        abi: [], // ABI would be provided by the caller
        functionName,
        args,
        account: from,
        value,
      })

      const transaction: HederaTransaction = {
        hash,
        type: 'contract_call',
        from,
        to: contractAddress,
        value,
        timestamp: Date.now(),
        status: 'pending'
      }

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash })
      
      transaction.status = receipt.status === 'success' ? 'confirmed' : 'failed'
      
      console.log(`✅ Contract call completed: ${functionName} on ${contractAddress}`)
      return transaction
    } catch (error) {
      console.error('Failed to call contract:', error)
      throw error
    }
  }

  /**
   * Deploy a smart contract
   */
  async deployContract(
    bytecode: `0x${string}`,
    from: `0x${string}`,
    args?: any[]
  ): Promise<HederaTransaction> {
    if (!this.walletClient) {
      throw new Error('Wallet client not set. Call setWalletClient() first.')
    }

    try {
      const hash = await this.walletClient.deployContract({
        bytecode,
        account: from,
        args,
      })

      const transaction: HederaTransaction = {
        hash,
        type: 'contract_deploy',
        from,
        timestamp: Date.now(),
        status: 'pending'
      }

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash })
      
      transaction.status = receipt.status === 'success' ? 'confirmed' : 'failed'
      transaction.to = receipt.contractAddress // Set deployed contract address
      
      console.log(`✅ Contract deployed: ${receipt.contractAddress}`)
      return transaction
    } catch (error) {
      console.error('Failed to deploy contract:', error)
      throw error
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(hash: `0x${string}`) {
    try {
      const transaction = await this.publicClient.getTransaction({ hash })
      return transaction
    } catch (error) {
      console.error('Failed to get transaction:', error)
      throw error
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(hash: `0x${string}`) {
    try {
      const receipt = await this.publicClient.getTransactionReceipt({ hash })
      return receipt
    } catch (error) {
      console.error('Failed to get transaction receipt:', error)
      throw error
    }
  }

  /**
   * Get current chain information
   */
  getChainInfo() {
    return {
      id: this.chain.id,
      name: this.chain.name,
      network: this.chain.network,
      rpcUrl: this.chain.rpcUrls.default.http[0],
      blockExplorer: this.chain.blockExplorers.default.url,
      nativeCurrency: this.chain.nativeCurrency,
      testnet: this.chain.testnet
    }
  }

  /**
   * Switch Hedera network
   * Only Hedera Testnet is supported per current configuration
   */
  switchNetwork(chainId: number) {
    if (chainId !== hederaTestnet.id) {
      console.warn('Only Hedera Testnet is supported. Staying on hederaTestnet.')
    }
    this.chain = hederaTestnet
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(),
    })
    console.log(`Switched to ${this.chain.name}`)
  }
}

// Singleton instance
let hederaViemIntegrationInstance: HederaViemIntegration | null = null

export function getHederaViemIntegration(): HederaViemIntegration {
  if (!hederaViemIntegrationInstance) {
    hederaViemIntegrationInstance = new HederaViemIntegration()
  }
  return hederaViemIntegrationInstance
}

// Export the class for testing
export { HederaViemIntegration }
