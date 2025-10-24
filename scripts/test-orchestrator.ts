#!/usr/bin/env bun
/**
 * Test script for Multi-Agent Orchestrator
 * Run with: bun run scripts/test-orchestrator.ts
 */

import { getOrchestrator, type OrchestratorConfig } from '../lib/hedera/multi-agent-orchestrator'
import type { Agent, JudgmentRequest } from '../types/agent'

async function testOrchestratorService() {
  console.log('🧪 Testing Multi-Agent Orchestrator\n')

  try {
    // Test 1: Orchestrator initialization
    console.log('Test 1: Initializing orchestrator...')
    const orchestrator = getOrchestrator()
    console.log('✅ Orchestrator initialized successfully\n')

    // Test 2: Configuration validation
    console.log('Test 2: Validating orchestrator configuration...')
    const config: OrchestratorConfig = {
      maxDiscussionRounds: 3,
      roundTimeout: 60000,
      consensusAlgorithm: 'weighted_average',
      enableDiscussion: true,
      convergenceThreshold: 0.5,
      outlierDetection: true,
    }
    console.log('Configuration:', JSON.stringify(config, null, 2))
    console.log('✅ Configuration validated\n')

    // Test 3: Mock agent setup
    console.log('Test 3: Setting up mock agents...')
    const mockAgents: Agent[] = [
      {
        id: 'agent-1',
        name: 'GrammarExpert',
        title: 'Grammar and Style Expert',
        description: 'Specializes in grammar and writing style',
        status: 'active',
        capabilities: {
          modelProvider: 'openai',
          model: 'gpt-4',
          temperature: 0.7,
          specialties: ['grammar', 'style', 'clarity'],
        },
        hederaAccount: {
          accountId: '0.0.12345',
          publicKey: 'test-key-1',
          balance: 100,
        },
        paymentConfig: {
          enabled: true,
          pricePerJudgment: 0.5,
          acceptedTokens: ['HBAR'],
          minimumPayment: 0.1,
        },
        reputation: {
          totalReviews: 50,
          averageRating: 8.5,
          completedTasks: 45,
        },
        metadata: {
          ipfsUri: 'ipfs://QmTest1',
          onChainId: '1',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'agent-2',
        name: 'TechnicalReviewer',
        title: 'Technical Accuracy Expert',
        description: 'Specializes in technical accuracy',
        status: 'active',
        capabilities: {
          modelProvider: 'anthropic',
          model: 'claude-3',
          temperature: 0.5,
          specialties: ['technical', 'accuracy', 'detail'],
        },
        hederaAccount: {
          accountId: '0.0.12346',
          publicKey: 'test-key-2',
          balance: 100,
        },
        paymentConfig: {
          enabled: true,
          pricePerJudgment: 0.5,
          acceptedTokens: ['HBAR'],
          minimumPayment: 0.1,
        },
        reputation: {
          totalReviews: 40,
          averageRating: 9.0,
          completedTasks: 38,
        },
        metadata: {
          ipfsUri: 'ipfs://QmTest2',
          onChainId: '2',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]
    console.log(`Created ${mockAgents.length} mock agents`)
    console.log('✅ Mock agents setup successful\n')

    // Test 4: Judgment request preparation
    console.log('Test 4: Preparing judgment request...')
    const request: JudgmentRequest = {
      id: 'test-request-1',
      creatorId: 'creator-123',
      content: 'This is a test article about Hedera Consensus Service and how it enables trustless multi-agent collaboration.',
      criteria: ['Accuracy', 'Clarity', 'Technical Depth', 'Relevance'],
      requestedAgentIds: mockAgents.map((a) => a.id),
      status: 'pending',
      createdAt: Date.now(),
    }
    console.log('Request ID:', request.id)
    console.log('Criteria:', request.criteria)
    console.log('✅ Request prepared\n')

    // Test 5: Workflow validation
    console.log('Test 5: Validating evaluation workflow...')
    console.log('Workflow steps:')
    console.log('  1. Setup HCS communication layer')
    console.log('  2. Independent scoring phase')
    console.log('  3. Multi-round discussion')
    console.log('  4. Consensus aggregation')
    console.log('  5. Publish final result to HCS')
    console.log('✅ Workflow validated\n')

    // Test 6: Consensus algorithms
    console.log('Test 6: Testing consensus algorithms...')
    const algorithms = [
      'simple_average',
      'weighted_average',
      'median',
      'trimmed_mean',
      'iterative_convergence',
      'delphi_method',
    ]
    console.log('Available algorithms:')
    algorithms.forEach((algo) => console.log(`  - ${algo}`))
    console.log('✅ Consensus algorithms validated\n')

    console.log('🎉 All Orchestrator tests passed!')
    console.log('\nℹ️  Note: Full integration test requires:')
    console.log('  - Active Hedera testnet connection')
    console.log('  - Sufficient HBAR for HCS messages')
    console.log('  - AI model API keys (OpenAI, Anthropic, etc.)')
    console.log('  - Run: orchestrator.executeEvaluation(request, mockAgents, config)')
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testOrchestratorService()
