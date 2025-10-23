/**
 * X402 Payment Service
 * Implements the A2A x402 extension for agent-to-agent payments
 * Supporting cryptocurrency payments for agent services
 */

import type { Agent, PaymentRequest } from '@/types/agent'
import { getHederaService } from '@/lib/hedera/agent-service'

export interface X402PaymentResponse {
  status: 402 // Payment Required
  headers: {
    'X-Payment-Required': string
    'X-Payment-Amount': string
    'X-Payment-Currency': string
    'X-Payment-Address': string
    'X-Payment-Token': string
  }
  body: {
    message: string
    payment: {
      amount: number
      currency: string
      address: string
      acceptedTokens: string[]
      minimumPayment?: number
    }
    agent: {
      id: string
      name: string
      service: string
    }
  }
}

export class X402PaymentService {
  /**
   * Generate X402 payment required response
   */
  generatePaymentRequired(agent: Agent, service: string): X402PaymentResponse {
    return {
      status: 402,
      headers: {
        'X-Payment-Required': 'true',
        'X-Payment-Amount': agent.paymentConfig.pricePerJudgment.toString(),
        'X-Payment-Currency': 'HBAR',
        'X-Payment-Address': agent.hederaAccount.accountId,
        'X-Payment-Token': agent.paymentConfig.acceptedTokens.join(','),
      },
      body: {
        message: 'Payment required to access this agent service',
        payment: {
          amount: agent.paymentConfig.pricePerJudgment,
          currency: 'HBAR',
          address: agent.hederaAccount.accountId,
          acceptedTokens: agent.paymentConfig.acceptedTokens,
          minimumPayment: agent.paymentConfig.minimumPayment,
        },
        agent: {
          id: agent.id,
          name: agent.name,
          service,
        },
      },
    }
  }

  /**
   * Verify payment from A2A request
   */
  async verifyPayment(
    paymentRequest: PaymentRequest,
    agent: Agent
  ): Promise<boolean> {
    try {
      // Check if payment amount meets minimum requirement
      if (paymentRequest.amount < agent.paymentConfig.pricePerJudgment) {
        console.error('Payment amount insufficient')
        return false
      }

      // Verify payment is to correct address
      if (paymentRequest.to !== agent.hederaAccount.accountId) {
        console.error('Payment address mismatch')
        return false
      }

      // Verify token is accepted
      if (!agent.paymentConfig.acceptedTokens.includes(paymentRequest.token)) {
        console.error('Token not accepted')
        return false
      }

      // In production, verify actual on-chain transaction
      // For now, we'll trust the payment request
      return true
    } catch (error) {
      console.error('Error verifying payment:', error)
      return false
    }
  }

  /**
   * Process agent-to-agent payment
   * Implements A2A payment flow
   */
  async processA2APayment(
    fromAgent: Agent,
    toAgent: Agent,
    amount: number,
    service: string
  ): Promise<PaymentRequest> {
    try {
      // Check if target agent requires payment
      if (!toAgent.paymentConfig.enabled) {
        throw new Error('Agent does not accept payments')
      }

      // Generate payment request ID
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create payment request
      const paymentRequest: PaymentRequest = {
        amount,
        token: 'HBAR',
        from: fromAgent.hederaAccount.accountId,
        to: toAgent.hederaAccount.accountId,
        agentId: toAgent.id,
        judgmentRequestId: '', // Will be set by caller
        status: 'pending',
        createdAt: Date.now(),
      }

      // Execute payment via Hedera
      const hederaService = getHederaService()

      // In a real implementation, the fromAgent would have its private key securely stored
      // For now, we'll simulate the payment
      console.log(`Processing A2A payment: ${fromAgent.name} -> ${toAgent.name}`)
      console.log(`Amount: ${amount} HBAR for ${service}`)

      // Update payment status
      paymentRequest.status = 'processing'

      return paymentRequest
    } catch (error) {
      console.error('Error processing A2A payment:', error)
      throw error
    }
  }

  /**
   * Create payment proof for ERC-8004 reputation
   * Payment proofs can be used to enrich reputation signals
   */
  createPaymentProof(paymentRequest: PaymentRequest): string {
    const proof = {
      txHash: paymentRequest.txHash,
      amount: paymentRequest.amount,
      token: paymentRequest.token,
      from: paymentRequest.from,
      to: paymentRequest.to,
      timestamp: paymentRequest.createdAt,
      status: paymentRequest.status,
    }

    // In production, this would be cryptographically signed
    return Buffer.from(JSON.stringify(proof)).toString('base64')
  }

  /**
   * Verify payment proof
   */
  verifyPaymentProof(proof: string): boolean {
    try {
      const decoded = JSON.parse(
        Buffer.from(proof, 'base64').toString('utf-8')
      )

      // Verify required fields
      return !!(
        decoded.txHash &&
        decoded.amount &&
        decoded.token &&
        decoded.from &&
        decoded.to &&
        decoded.timestamp
      )
    } catch (error) {
      console.error('Error verifying payment proof:', error)
      return false
    }
  }

  /**
   * Calculate total cost for multi-agent system
   */
  calculateMultiAgentCost(agents: Agent[]): number {
    return agents.reduce((total, agent) => {
      return total + (agent.paymentConfig.enabled ? agent.paymentConfig.pricePerJudgment : 0)
    }, 0)
  }

  /**
   * Process batch payment for multi-agent system
   */
  async processBatchPayment(
    payerAccountId: string,
    payerPrivateKey: string,
    agents: Agent[],
    requestId: string
  ): Promise<PaymentRequest[]> {
    const payments: PaymentRequest[] = []
    const hederaService = getHederaService()

    for (const agent of agents) {
      if (!agent.paymentConfig.enabled) continue

      try {
        // Execute payment
        const txHash = await hederaService.transferHbar(
          payerAccountId,
          payerPrivateKey,
          agent.hederaAccount.accountId,
          agent.paymentConfig.pricePerJudgment
        )

        const payment: PaymentRequest = {
          amount: agent.paymentConfig.pricePerJudgment,
          token: 'HBAR',
          from: payerAccountId,
          to: agent.hederaAccount.accountId,
          agentId: agent.id,
          judgmentRequestId: requestId,
          status: 'completed',
          txHash,
          createdAt: Date.now(),
        }

        payments.push(payment)
      } catch (error) {
        console.error(`Error paying agent ${agent.name}:`, error)

        // Create failed payment record
        payments.push({
          amount: agent.paymentConfig.pricePerJudgment,
          token: 'HBAR',
          from: payerAccountId,
          to: agent.hederaAccount.accountId,
          agentId: agent.id,
          judgmentRequestId: requestId,
          status: 'failed',
          createdAt: Date.now(),
        })
      }
    }

    return payments
  }
}

// Singleton instance
let x402Service: X402PaymentService | null = null

export function getX402Service(): X402PaymentService {
  if (!x402Service) {
    x402Service = new X402PaymentService()
  }
  return x402Service
}
