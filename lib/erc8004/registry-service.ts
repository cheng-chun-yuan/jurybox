/**
 * ERC-8004 Registry Service
 * Implements the three core registries for agent discovery and trust:
 * 1. Identity Registry - Cross-chain agent IDs
 * 2. Reputation Registry - Verifiable feedback
 * 3. Validation Registry - Task verification
 */

import { ethers } from 'ethers'
import type { Agent, ERC8004Identity, ERC8004Reputation, JudgmentResult } from '@/types/agent'

// ERC-8004 Registry Contract ABIs (simplified)
const IDENTITY_REGISTRY_ABI = [
  'function registerAgent(string agentId, string metadata) external returns (bytes32)',
  'function getAgent(bytes32 registryId) external view returns (tuple(string agentId, string metadata, bool verified, uint256 registeredAt))',
  'function verifyAgent(bytes32 registryId) external',
  'event AgentRegistered(bytes32 indexed registryId, string agentId, address owner)',
]

const REPUTATION_REGISTRY_ABI = [
  'function submitFeedback(bytes32 agentId, uint256 rating, string comment, string paymentProof) external',
  'function getReputation(bytes32 agentId) external view returns (tuple(uint256 totalReviews, uint256 averageRating, uint256 completedTasks, uint256 successRate))',
  'event FeedbackSubmitted(bytes32 indexed agentId, uint256 rating, address submitter)',
]

const VALIDATION_REGISTRY_ABI = [
  'function submitValidation(bytes32 agentId, string taskId, bytes proof) external',
  'function getValidation(string taskId) external view returns (tuple(bytes32 agentId, bytes proof, bool validated, uint256 timestamp))',
  'event ValidationSubmitted(bytes32 indexed agentId, string taskId)',
]

export class ERC8004RegistryService {
  private provider: ethers.Provider
  private signer?: ethers.Signer
  private identityRegistry?: ethers.Contract
  private reputationRegistry?: ethers.Contract
  private validationRegistry?: ethers.Contract

  constructor() {
    // Initialize provider (using public RPC or custom)
    const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo'
    this.provider = new ethers.JsonRpcProvider(rpcUrl)

    // Initialize signer if private key is available
    const privateKey = process.env.ETHEREUM_PRIVATE_KEY
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider)
    }

    // Initialize contract instances (addresses would come from config)
    const identityAddress = process.env.IDENTITY_REGISTRY_ADDRESS
    const reputationAddress = process.env.REPUTATION_REGISTRY_ADDRESS
    const validationAddress = process.env.VALIDATION_REGISTRY_ADDRESS

    if (identityAddress && this.signer) {
      this.identityRegistry = new ethers.Contract(
        identityAddress,
        IDENTITY_REGISTRY_ABI,
        this.signer
      )
    }

    if (reputationAddress && this.signer) {
      this.reputationRegistry = new ethers.Contract(
        reputationAddress,
        REPUTATION_REGISTRY_ABI,
        this.signer
      )
    }

    if (validationAddress && this.signer) {
      this.validationRegistry = new ethers.Contract(
        validationAddress,
        VALIDATION_REGISTRY_ABI,
        this.signer
      )
    }
  }

  /**
   * Register agent in Identity Registry
   */
  async registerAgent(agent: Agent): Promise<ERC8004Identity> {
    try {
      // Create metadata object
      const metadata = {
        name: agent.name,
        title: agent.title,
        hederaAccount: agent.hederaAccount.accountId,
        capabilities: agent.capabilities,
        createdAt: agent.createdAt,
      }

      // In production, submit to actual registry contract
      // For now, generate a mock registry ID
      const registryId = ethers.keccak256(
        ethers.toUtf8Bytes(`${agent.id}-${Date.now()}`)
      )

      console.log('Registering agent in ERC-8004 Identity Registry')
      console.log(`Agent ID: ${agent.id}`)
      console.log(`Registry ID: ${registryId}`)

      // Simulate on-chain registration
      // In production: await this.identityRegistry.registerAgent(agent.id, JSON.stringify(metadata))

      return {
        registryId,
        agentId: agent.id,
        chainId: 11155111, // Sepolia testnet
        verified: false,
        registeredAt: Date.now(),
      }
    } catch (error) {
      console.error('Error registering agent:', error)
      throw error
    }
  }

  /**
   * Get agent identity from registry
   */
  async getAgentIdentity(registryId: string): Promise<ERC8004Identity | null> {
    try {
      // In production: const result = await this.identityRegistry.getAgent(registryId)
      // For now, return mock data
      console.log(`Fetching agent identity: ${registryId}`)
      return null
    } catch (error) {
      console.error('Error getting agent identity:', error)
      return null
    }
  }

  /**
   * Submit feedback to Reputation Registry
   */
  async submitFeedback(
    agent: Agent,
    rating: number,
    comment: string,
    paymentProof?: string
  ): Promise<void> {
    try {
      console.log('Submitting feedback to ERC-8004 Reputation Registry')
      console.log(`Agent: ${agent.name}, Rating: ${rating}/10`)

      // In production:
      // await this.reputationRegistry.submitFeedback(
      //   agent.identity.registryId,
      //   rating * 10, // Scale to 0-100
      //   comment,
      //   paymentProof || ''
      // )

      // Update local reputation (in production, this would be read from chain)
      agent.reputation.totalReviews += 1
      agent.reputation.averageRating =
        (agent.reputation.averageRating * (agent.reputation.totalReviews - 1) + rating) /
        agent.reputation.totalReviews
      agent.reputation.lastUpdated = Date.now()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      throw error
    }
  }

  /**
   * Get agent reputation from registry
   */
  async getAgentReputation(registryId: string): Promise<ERC8004Reputation> {
    try {
      // In production: const result = await this.reputationRegistry.getReputation(registryId)

      // For now, return mock data
      return {
        totalReviews: 0,
        averageRating: 0,
        completedJudgments: 0,
        successRate: 0,
        lastUpdated: Date.now(),
      }
    } catch (error) {
      console.error('Error getting reputation:', error)
      throw error
    }
  }

  /**
   * Submit validation to Validation Registry
   */
  async submitValidation(
    agent: Agent,
    judgmentResult: JudgmentResult
  ): Promise<void> {
    try {
      console.log('Submitting validation to ERC-8004 Validation Registry')
      console.log(`Agent: ${agent.name}, Judgment: ${judgmentResult.id}`)

      // Create validation proof
      const proof = {
        judgmentId: judgmentResult.id,
        agentId: agent.id,
        score: judgmentResult.score,
        completedAt: judgmentResult.completedAt,
        paymentTx: judgmentResult.paymentTx,
      }

      const proofBytes = ethers.toUtf8Bytes(JSON.stringify(proof))

      // In production:
      // await this.validationRegistry.submitValidation(
      //   agent.identity.registryId,
      //   judgmentResult.id,
      //   proofBytes
      // )

      // Update agent statistics
      agent.reputation.completedJudgments += 1
      agent.reputation.successRate =
        agent.reputation.completedJudgments / (agent.reputation.completedJudgments + 1)
    } catch (error) {
      console.error('Error submitting validation:', error)
      throw error
    }
  }

  /**
   * Verify agent identity
   * This would typically be done by a trusted verifier
   */
  async verifyAgent(agent: Agent): Promise<void> {
    try {
      console.log(`Verifying agent: ${agent.name}`)

      // In production:
      // await this.identityRegistry.verifyAgent(agent.identity.registryId)

      agent.identity.verified = true
    } catch (error) {
      console.error('Error verifying agent:', error)
      throw error
    }
  }

  /**
   * Create comprehensive agent profile combining all registries
   */
  async getAgentProfile(registryId: string): Promise<{
    identity: ERC8004Identity | null
    reputation: ERC8004Reputation
  }> {
    const identity = await this.getAgentIdentity(registryId)
    const reputation = await this.getAgentReputation(registryId)

    return {
      identity,
      reputation,
    }
  }

  /**
   * Search agents by capabilities
   */
  async searchAgents(specialty: string): Promise<string[]> {
    // In production, this would query the identity registry
    // For now, return empty array
    console.log(`Searching for agents with specialty: ${specialty}`)
    return []
  }

  /**
   * Get trending agents based on reputation
   */
  async getTrendingAgents(limit: number = 10): Promise<string[]> {
    // In production, query reputation registry for highest-rated agents
    console.log(`Fetching top ${limit} trending agents`)
    return []
  }
}

// Singleton instance
let registryService: ERC8004RegistryService | null = null

export function getRegistryService(): ERC8004RegistryService {
  if (!registryService) {
    registryService = new ERC8004RegistryService()
  }
  return registryService
}
