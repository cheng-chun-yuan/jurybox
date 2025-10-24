/**
 * Simple Example: Register an Agent
 *
 * Quick example showing the complete flow in minimal code.
 */

import { getViemRegistryService } from '@/lib/erc8004/viem-registry-service'

async function registerAgent() {
  const registry = getViemRegistryService()

  // 1. Create metadata
  const metadata = {
    name: 'MyAgent',
    title: 'AI Assistant',
    capabilities: ['coding', 'analysis'],
    createdAt: Date.now(),
  }

  // 2. Register (uploads to IPFS + stores on-chain)
  const { agentId, txHash, ipfsUri } = await registry.registerAgent(metadata)

  console.log('✅ Agent registered!')
  console.log('Agent ID:', agentId)
  console.log('IPFS:', ipfsUri)
  console.log('TX:', txHash)

  // 3. Fetch it back
  const fetchedMetadata = await registry.getAgentMetadata(agentId)
  console.log('\nFetched metadata:', fetchedMetadata)

  return agentId
}

registerAgent().catch(console.error)
