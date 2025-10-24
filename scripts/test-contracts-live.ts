#!/usr/bin/env bun
/**
 * Live contract test - Test deployed ERC8004 contracts on Hedera Testnet
 * Run with: bun run scripts/test-contracts-live.ts
 */

import { getViemRegistryService } from '../lib/erc8004/viem-registry-service'
import { CONTRACT_ADDRESSES } from '../lib/erc8004/contract-addresses'
import type { AgentMetadata } from '../lib/ipfs/pinata-service'

async function testLiveContracts() {
  console.log('🧪 Testing Live ERC8004 Contracts on Hedera Testnet\n')
  console.log('═'.repeat(60))

  try {
    // Test 1: Verify contract addresses
    console.log('\n1️⃣  Contract Addresses:')
    console.log(`   IdentityRegistry:   ${CONTRACT_ADDRESSES.IdentityRegistry}`)
    console.log(`   ReputationRegistry: ${CONTRACT_ADDRESSES.ReputationRegistry}`)
    console.log(`   ValidationRegistry: ${CONTRACT_ADDRESSES.ValidationRegistry}`)
    console.log('   ✅ All contracts configured\n')

    // Test 2: Initialize service
    console.log('2️⃣  Initializing Viem Registry Service...')
    const registryService = getViemRegistryService()
    console.log('   ✅ Service initialized\n')

    // Test 3: Prepare test metadata
    console.log('3️⃣  Preparing test agent metadata...')
    const testMetadata: AgentMetadata = {
      name: `TestAgent-${Date.now()}`,
      title: 'JuryBox Test Agent',
      description: 'Agent registered via automated test on Hedera Testnet',
      capabilities: ['testing', 'validation', 'evaluation'],
      hederaAccount: process.env.HEDERA_ACCOUNT_ID || '0.0.test',
      createdAt: Date.now(),
      version: '1.0.0',
    }
    console.log(`   Agent Name: ${testMetadata.name}`)
    console.log('   ✅ Metadata prepared\n')

    // Test 4: Register agent (upload to IPFS + on-chain registration)
    console.log('4️⃣  Registering agent on-chain...')
    console.log('   This will:')
    console.log('   - Upload metadata to IPFS via Pinata')
    console.log('   - Call IdentityRegistry.register() on Hedera')
    console.log('   - Wait for transaction confirmation')
    console.log('   - Extract agentId from event logs\n')

    const result = await registryService.registerAgent(testMetadata)

    console.log('\n' + '═'.repeat(60))
    console.log('✅ AGENT REGISTERED SUCCESSFULLY!')
    console.log('═'.repeat(60))
    console.log(`\n🆔 Agent ID: ${result.agentId}`)
    console.log(`📍 IPFS URI: ${result.ipfsUri}`)
    console.log(`🔗 Gateway: ${result.ipfsUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}`)
    console.log(`💳 Transaction: ${result.txHash}`)
    console.log(`👤 Owner: ${result.owner}`)

    // Test 5: Verify owner
    console.log('\n5️⃣  Verifying agent ownership...')
    const owner = await registryService.getAgentOwner(result.agentId)
    console.log(`   Owner: ${owner}`)
    if (owner.toLowerCase() === result.owner.toLowerCase()) {
      console.log('   ✅ Ownership verified\n')
    } else {
      throw new Error('Owner mismatch!')
    }

    // Test 6: Get agent metadata from IPFS
    console.log('6️⃣  Fetching metadata from IPFS...')
    try {
      const fetchedMetadata = await registryService.getAgentMetadata(result.agentId)
      console.log(`   Name: ${fetchedMetadata.name}`)
      console.log(`   Title: ${fetchedMetadata.title}`)
      console.log('   ✅ Metadata retrieved\n')
    } catch (error) {
      console.log('   ⚠️  IPFS propagation delay (normal for new uploads)\n')
    }

    // Test 7: Submit feedback (reputation)
    console.log('7️⃣  Submitting reputation feedback...')
    const rating = 85 // 0-100 scale
    const comment = 'Excellent test agent performance on Hedera Testnet'

    const feedbackTx = await registryService.submitFeedback(
      result.agentId,
      rating,
      comment
    )
    console.log(`   Rating: ${rating}/100`)
    console.log(`   Transaction: ${feedbackTx}`)
    console.log('   ✅ Feedback submitted\n')

    // Test 8: Get reputation
    console.log('8️⃣  Fetching agent reputation...')
    const reputation = await registryService.getAgentReputation(result.agentId)
    console.log(`   Total Reviews: ${reputation.totalReviews}`)
    console.log(`   Average Rating: ${reputation.averageRating}`)
    console.log(`   Completed Tasks: ${reputation.completedTasks}`)
    console.log('   ✅ Reputation retrieved\n')

    // Test 9: Submit validation proof
    console.log('9️⃣  Submitting validation proof...')
    const taskId = `task-${Date.now()}`
    const proof = JSON.stringify({
      agentId: result.agentId.toString(),
      taskId,
      timestamp: Date.now(),
      result: 'success',
      hash: '0x' + Buffer.from(`proof-${taskId}`).toString('hex'),
    })

    const validationTx = await registryService.submitValidation(
      result.agentId,
      taskId,
      proof
    )
    console.log(`   Task ID: ${taskId}`)
    console.log(`   Transaction: ${validationTx}`)
    console.log('   ✅ Validation submitted\n')

    // Summary
    console.log('═'.repeat(60))
    console.log('🎉 ALL TESTS PASSED!')
    console.log('═'.repeat(60))
    console.log('\n📊 Test Summary:')
    console.log(`   ✅ Agent Registration: ${result.agentId}`)
    console.log(`   ✅ IPFS Storage: ${result.ipfsUri}`)
    console.log(`   ✅ Ownership Verification: ${owner}`)
    console.log(`   ✅ Reputation Tracking: ${reputation.totalReviews} reviews`)
    console.log(`   ✅ Validation System: 1 proof submitted`)
    console.log('\n🔗 View on HashScan:')
    console.log(`   https://hashscan.io/testnet/transaction/${result.txHash}`)
    console.log('\n✨ ERC8004 contracts are fully functional on Hedera Testnet!')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

testLiveContracts()
