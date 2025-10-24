/**
 * Demo: Agent Registration with IPFS and On-Chain Storage
 *
 * This script demonstrates:
 * 1. Creating agent metadata
 * 2. Uploading metadata to IPFS via Pinata
 * 3. Registering agent on-chain with IPFS URI
 * 4. Extracting agent ID from transaction
 * 5. Retrieving metadata from IPFS
 *
 * Usage:
 *   bun run scripts/demo-agent-registration.ts
 */

import { getViemRegistryService } from '@/lib/erc8004/viem-registry-service'
import type { AgentMetadata } from '@/lib/ipfs/pinata-service'

async function main() {
  console.log('🎯 Agent Registration Demo\n')
  console.log('=' .repeat(60))

  const registryService = getViemRegistryService()

  // Step 1: Create agent metadata
  console.log('\n📋 Step 1: Creating agent metadata...')
  const metadata: AgentMetadata = {
    name: 'CodeReviewer',
    title: 'Senior Code Review Agent',
    description: 'Expert in code quality analysis, security audits, and best practices',
    capabilities: [
      'code-review',
      'security-audit',
      'performance-analysis',
      'best-practices',
      'documentation-review',
    ],
    hederaAccount: '0.0.12345', // Replace with actual Hedera account
    createdAt: Date.now(),
    version: '1.0.0',
  }

  console.log('✅ Metadata created:')
  console.log(JSON.stringify(metadata, null, 2))

  // Step 2: Register agent (uploads to IPFS + registers on-chain)
  console.log('\n📝 Step 2: Registering agent...')
  console.log('This will:')
  console.log('  1. Upload metadata to IPFS via Pinata')
  console.log('  2. Register agent on-chain with IPFS URI')
  console.log('  3. Wait for transaction confirmation')
  console.log('  4. Extract agent ID from event logs\n')

  const result = await registryService.registerAgent(metadata)

  console.log('\n' + '='.repeat(60))
  console.log('✅ REGISTRATION SUCCESSFUL!')
  console.log('='.repeat(60))
  console.log(`\n🆔 Agent ID: ${result.agentId}`)
  console.log(`📍 IPFS URI: ${result.ipfsUri}`)
  console.log(`🔗 IPFS Gateway: ${result.ipfsUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}`)
  console.log(`💳 Transaction Hash: ${result.txHash}`)
  console.log(`👤 Owner: ${result.owner}`)

  // Step 3: Verify registration by fetching metadata
  console.log('\n📥 Step 3: Verifying registration by fetching metadata...')
  const fetchedMetadata = await registryService.getAgentMetadata(result.agentId)

  console.log('✅ Metadata retrieved from IPFS:')
  console.log(JSON.stringify(fetchedMetadata, null, 2))

  // Step 4: Get agent owner
  console.log('\n👤 Step 4: Fetching agent owner...')
  const owner = await registryService.getAgentOwner(result.agentId)
  console.log(`✅ Agent owner: ${owner}`)

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('🎉 DEMO COMPLETED SUCCESSFULLY!')
  console.log('='.repeat(60))
  console.log('\nNext steps:')
  console.log(`  1. Submit feedback: registryService.submitFeedback(${result.agentId}, 95, "Great work!")`)
  console.log(`  2. Get reputation: registryService.getAgentReputation(${result.agentId})`)
  console.log(`  3. Submit validation: registryService.submitValidation(${result.agentId}, "task-123", proof)`)
}

// Run the demo
main()
  .then(() => {
    console.log('\n✅ Demo completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Demo failed:', error)
    process.exit(1)
  })
