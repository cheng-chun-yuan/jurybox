#!/usr/bin/env bun
/**
 * Simple agent registration test
 * Run with: bun run scripts/test-registration-simple.ts
 */

import { getViemRegistryService } from '../lib/erc8004/viem-registry-service'
import { CONTRACT_ADDRESSES } from '../lib/erc8004/contract-addresses'
import type { AgentMetadata } from '../lib/ipfs/pinata-service'

async function testRegistration() {
  console.log('🧪 Simple Agent Registration Test\n')

  try {
    // Display contract addresses
    console.log('📋 Contract Addresses:')
    console.log(`   Identity: ${CONTRACT_ADDRESSES.IdentityRegistry}`)
    console.log(`   Reputation: ${CONTRACT_ADDRESSES.ReputationRegistry}`)
    console.log(`   Validation: ${CONTRACT_ADDRESSES.ValidationRegistry}\n`)

    // Initialize service
    const registryService = getViemRegistryService()

    // Prepare metadata
    const metadata: AgentMetadata = {
      name: `JuryBoxAgent-${Date.now()}`,
      title: 'JuryBox Evaluation Agent',
      description: 'Multi-criteria evaluation agent for JuryBox platform',
      capabilities: ['accuracy', 'clarity', 'technical-depth', 'relevance'],
      hederaAccount: process.env.HEDERA_ACCOUNT_ID || '0.0.unknown',
      createdAt: Date.now(),
      version: '1.0.0',
    }

    console.log('📝 Agent Metadata:')
    console.log(`   Name: ${metadata.name}`)
    console.log(`   Title: ${metadata.title}`)
    console.log(`   Capabilities: ${metadata.capabilities.join(', ')}\n`)

    // Register agent
    console.log('🚀 Registering agent...\n')
    const result = await registryService.registerAgent(metadata)

    // Display results
    console.log('\n' + '═'.repeat(60))
    console.log('✅ REGISTRATION SUCCESSFUL!')
    console.log('═'.repeat(60))
    console.log(`\n🆔 Agent ID: ${result.agentId}`)
    console.log(`📍 IPFS: ${result.ipfsUri}`)
    console.log(`💳 TX: ${result.txHash}`)
    console.log(`👤 Owner: ${result.owner}`)
    console.log(`\n🔗 View on HashScan:`)
    console.log(`   https://hashscan.io/testnet/transaction/${result.txHash}`)
    console.log(`\n🌐 View Metadata:`)
    console.log(`   ${result.ipfsUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}`)

    // Verify ownership
    console.log(`\n✓ Verifying ownership...`)
    const owner = await registryService.getAgentOwner(result.agentId)
    if (owner.toLowerCase() === result.owner.toLowerCase()) {
      console.log(`  ✅ Owner verified: ${owner}`)
    }

    console.log('\n🎉 Test completed successfully!')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

testRegistration()
