/**
 * Hedera Agent Service
 * Handles Hedera blockchain operations for AI agents
 */

import { Client, AccountId, PrivateKey, TopicCreateTransaction, TopicMessageSubmitTransaction, AccountBalanceQuery, AccountCreateTransaction, TransferTransaction, Hbar } from '@hashgraph/sdk'

export interface HederaAccount {
  accountId: string
  publicKey: string
  privateKey: string
  balance: number
}

export interface HederaTopic {
  topicId: string
  topicMemo: string
  createdAt: number
}

class HederaAgentService {
  private client: Client | null = null
  private operatorAccountId: string | null = null
  private operatorPrivateKey: PrivateKey | null = null

  constructor() {
    this.initializeClient()
  }

  private initializeClient() {
    try {
      const accountId = process.env.HEDERA_ACCOUNT_ID
      const privateKey = process.env.HEDERA_PRIVATE_KEY

      if (!accountId || !privateKey) {
        console.warn('Hedera credentials not configured. Service will run in mock mode.')
        return
      }

      this.operatorAccountId = accountId
      this.operatorPrivateKey = PrivateKey.fromString(privateKey)

      // Initialize client for testnet
      this.client = Client.forTestnet()
      this.client.setOperator(AccountId.fromString(accountId), this.operatorPrivateKey)

      console.log('✅ Hedera client initialized for testnet')
    } catch (error) {
      console.error('❌ Failed to initialize Hedera client:', error)
      this.client = null
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string): Promise<number> {
    if (!this.client) {
      throw new Error('Hedera client not initialized')
    }

    try {
      const query = new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId))
      
      const balance = await query.execute(this.client)
      return balance.hbars.toTinybars().toNumber() / 100_000_000 // Convert to HBAR
    } catch (error) {
      console.error('Failed to get account balance:', error)
      throw error
    }
  }

  /**
   * Create a new HCS topic for agent communication
   */
  async createAgentTopic(topicMemo: string): Promise<string> {
    if (!this.client) {
      // Mock mode - return a fake topic ID
      const mockTopicId = `0.0.${Math.floor(Math.random() * 100000)}`
      console.log(`🔧 Mock mode: Created topic ${mockTopicId}`)
      return mockTopicId
    }

    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo(topicMemo)
        .setMaxTransactionFee(new Hbar(2))

      const response = await transaction.execute(this.client)
      const receipt = await response.getReceipt(this.client)
      
      const topicId = receipt.topicId?.toString()
      if (!topicId) {
        throw new Error('Failed to get topic ID from receipt')
      }

      console.log(`✅ Created HCS topic: ${topicId}`)
      return topicId
    } catch (error) {
      console.error('Failed to create HCS topic:', error)
      throw error
    }
  }

  /**
   * Submit a message to an HCS topic
   */
  async submitTopicMessage(topicId: string, message: string): Promise<string> {
    if (!this.client) {
      // Mock mode
      const mockTxId = `0.0.${Math.floor(Math.random() * 100000)}@${Date.now()}`
      console.log(`🔧 Mock mode: Submitted message to topic ${topicId}`)
      return mockTxId
    }

    try {
      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(message)

      const response = await transaction.execute(this.client)
      const receipt = await response.getReceipt(this.client)
      
      const transactionId = response.transactionId.toString()
      console.log(`✅ Submitted message to topic ${topicId}`)
      return transactionId
    } catch (error) {
      console.error('Failed to submit topic message:', error)
      throw error
    }
  }

  /**
   * Create a new Hedera account for an agent
   */
  async createAgentAccount(initialBalance: number = 10): Promise<HederaAccount> {
    if (!this.client) {
      // Mock mode - return a fake account
      const mockAccountId = `0.0.${Math.floor(Math.random() * 100000)}`
      const mockPrivateKey = PrivateKey.generateED25519()
      const mockPublicKey = mockPrivateKey.publicKey.toString()
      
      console.log(`🔧 Mock mode: Created agent account ${mockAccountId}`)
      return {
        accountId: mockAccountId,
        publicKey: mockPublicKey,
        privateKey: mockPrivateKey.toString(),
        balance: initialBalance
      }
    }

    try {
      // Generate new key pair for the agent
      const newPrivateKey = PrivateKey.generateED25519()
      const newPublicKey = newPrivateKey.publicKey

      // Create account transaction
      const transaction = new AccountCreateTransaction()
        .setKey(newPublicKey)
        .setInitialBalance(new Hbar(initialBalance))

      const response = await transaction.execute(this.client)
      const receipt = await response.getReceipt(this.client)
      
      const accountId = receipt.accountId?.toString()
      if (!accountId) {
        throw new Error('Failed to get account ID from receipt')
      }

      console.log(`✅ Created agent account: ${accountId}`)
      return {
        accountId,
        publicKey: newPublicKey.toString(),
        privateKey: newPrivateKey.toString(),
        balance: initialBalance
      }
    } catch (error) {
      console.error('Failed to create agent account:', error)
      throw error
    }
  }

  /**
   * Transfer HBAR between accounts
   */
  async transferHBAR(fromAccountId: string, toAccountId: string, amount: number, privateKey: string): Promise<string> {
    if (!this.client) {
      // Mock mode
      const mockTxId = `0.0.${Math.floor(Math.random() * 100000)}@${Date.now()}`
      console.log(`🔧 Mock mode: Transferred ${amount} HBAR from ${fromAccountId} to ${toAccountId}`)
      return mockTxId
    }

    try {
      const fromPrivateKey = PrivateKey.fromString(privateKey)
      
      const transaction = new TransferTransaction()
        .addHbarTransfer(AccountId.fromString(fromAccountId), new Hbar(-amount))
        .addHbarTransfer(AccountId.fromString(toAccountId), new Hbar(amount))

      const response = await transaction.execute(this.client)
      const receipt = await response.getReceipt(this.client)
      
      const transactionId = response.transactionId.toString()
      console.log(`✅ Transferred ${amount} HBAR from ${fromAccountId} to ${toAccountId}`)
      return transactionId
    } catch (error) {
      console.error('Failed to transfer HBAR:', error)
      throw error
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.client !== null
  }

  /**
   * Get the current operator account ID
   */
  getOperatorAccountId(): string | null {
    return this.operatorAccountId
  }

  /**
   * Close the Hedera client
   */
  close() {
    if (this.client) {
      this.client.close()
      this.client = null
    }
  }
}

// Singleton instance
let hederaServiceInstance: HederaAgentService | null = null

export function getHederaService(): HederaAgentService {
  if (!hederaServiceInstance) {
    hederaServiceInstance = new HederaAgentService()
  }
  return hederaServiceInstance
}

// Export the class for testing
export { HederaAgentService }
