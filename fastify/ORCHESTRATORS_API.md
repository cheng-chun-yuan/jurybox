# Orchestrators API Implementation

## Endpoints

### GET /api/orchestrators
Get all orchestrators or filter by user address.

**Query Parameters:**
- `userAddress` (optional) - Filter by user's wallet address

**Response:**
```json
{
  "success": true,
  "orchestrators": [
    {
      "id": "orch_abc123",
      "name": "My Research Evaluator",
      "description": "Evaluates research papers",
      "user_address": "0x742d35...",
      "status": "active",
      "wallet_account_id": "0.0.7125500",
      "wallet_evm_address": "0x742d35...",
      "wallet_balance": 10.5,
      "max_discussion_rounds": 3,
      "consensus_algorithm": "majority",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Implementation:**
```typescript
import { FastifyInstance } from 'fastify'
import { OrchestratorsModel, JudgesModel, OrchestratorJudgesModel } from '../../lib/db/models'
import { nanoid } from 'nanoid'

export async function orchestratorsRoutes(fastify: FastifyInstance) {
  // GET /api/orchestrators
  fastify.get<{ Querystring: { userAddress?: string } }>(
    '/api/orchestrators',
    async (request, reply) => {
      try {
        const { userAddress } = request.query

        let orchestrators
        if (userAddress) {
          orchestrators = await OrchestratorsModel.findByUserAddress(userAddress)
        } else {
          orchestrators = await OrchestratorsModel.findAll()
        }

        // Don't expose private key in response
        const safeOrchestrators = orchestrators.map((orch) => {
          const { wallet_private_key_encrypted, ...safe } = orch
          return {
            ...safe,
            metadata: orch.metadata || {},
          }
        })

        return { success: true, orchestrators: safeOrchestrators }
      } catch (error) {
        fastify.log.error(error)
        reply.code(500)
        return { success: false, error: 'Failed to fetch orchestrators' }
      }
    }
  )
}
```

---

### GET /api/orchestrators/:id
Get a specific orchestrator with its judges.

**Response:**
```json
{
  "success": true,
  "orchestrator": {
    "id": "orch_abc123",
    "name": "My Research Evaluator",
    "judges": [
      {
        "id": 1,
        "name": "Dr. Alex Chen",
        "specialty": "Technical",
        "price": 0.05
      }
    ],
    "wallet": {
      "accountId": "0.0.7125500",
      "evmAddress": "0x742d35...",
      "balance": 10.5
    }
  }
}
```

**Implementation:**
```typescript
// GET /api/orchestrators/:id
fastify.get<{ Params: { id: string } }>(
  '/api/orchestrators/:id',
  async (request, reply) => {
    try {
      const orchestrator = await OrchestratorsModel.findById(request.params.id)

      if (!orchestrator) {
        reply.code(404)
        return { success: false, error: 'Orchestrator not found' }
      }

      // Get associated judges
      const judgeIds = await OrchestratorJudgesModel.findByOrchestratorId(orchestrator.id)
      const judges = judgeIds.length > 0 ? await JudgesModel.findByIds(judgeIds) : []

      // Remove private key from response
      const { wallet_private_key_encrypted, ...safeOrchestrator } = orchestrator

      return {
        success: true,
        orchestrator: {
          ...safeOrchestrator,
          judges: judges.map((j) => ({
            ...j,
            expertise: JSON.parse(j.expertise || '[]'),
          })),
          wallet: {
            accountId: orchestrator.wallet_account_id,
            evmAddress: orchestrator.wallet_evm_address,
            balance: orchestrator.wallet_balance,
          },
        },
      }
    } catch (error) {
      fastify.log.error(error)
      reply.code(500)
      return { success: false, error: 'Failed to fetch orchestrator' }
    }
  }
)
```

---

### POST /api/orchestrators
Create a new orchestrator with AA wallet.

**Request Body:**
```json
{
  "name": "My Research Evaluator",
  "description": "Evaluates research papers",
  "systemPrompt": "You are an orchestrator managing expert judges...",
  "userAddress": "0x742d35...",
  "judgeIds": [1, 2, 3],
  "walletInfo": {
    "accountId": "0.0.7125500",
    "evmAddress": "0x742d35...",
    "privateKeyEncrypted": "encrypted_key_here"
  },
  "config": {
    "maxDiscussionRounds": 3,
    "roundTimeout": 300,
    "consensusAlgorithm": "majority",
    "enableDiscussion": true,
    "convergenceThreshold": 0.75,
    "outlierDetection": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "orchestratorId": "orch_abc123",
  "wallet": {
    "accountId": "0.0.7125500",
    "address": "0x742d35...",
    "balance": 0
  }
}
```

**Implementation:**
```typescript
// POST /api/orchestrators
fastify.post<{
  Body: {
    name: string
    description?: string
    systemPrompt: string
    userAddress: string
    judgeIds?: number[]
    walletInfo: {
      accountId: string
      evmAddress: string
      privateKeyEncrypted: string
    }
    config?: {
      maxDiscussionRounds?: number
      roundTimeout?: number
      consensusAlgorithm?: 'majority' | 'unanimous' | 'weighted'
      enableDiscussion?: boolean
      convergenceThreshold?: number
      outlierDetection?: boolean
    }
  }
}>('/api/orchestrators', async (request, reply) => {
  try {
    const {
      name,
      description,
      systemPrompt,
      userAddress,
      judgeIds = [],
      walletInfo,
      config = {},
    } = request.body

    // Validate required fields
    if (!name || !systemPrompt || !userAddress) {
      reply.code(400)
      return { success: false, error: 'Name, system prompt, and user address are required' }
    }

    if (!walletInfo?.accountId || !walletInfo?.evmAddress || !walletInfo?.privateKeyEncrypted) {
      reply.code(400)
      return {
        success: false,
        error: 'Wallet info required (accountId, evmAddress, privateKeyEncrypted)',
      }
    }

    // Verify judges exist
    if (judgeIds.length > 0) {
      const judges = await JudgesModel.findByIds(judgeIds)
      if (judges.length !== judgeIds.length) {
        reply.code(400)
        return { success: false, error: 'One or more judge IDs are invalid' }
      }
    }

    const orchestratorId = `orch_${nanoid(16)}`

    // Create orchestrator
    await OrchestratorsModel.create({
      id: orchestratorId,
      name,
      description: description || null,
      system_prompt: systemPrompt,
      user_address: userAddress,
      status: 'pending',
      wallet_account_id: walletInfo.accountId,
      wallet_evm_address: walletInfo.evmAddress,
      wallet_private_key_encrypted: walletInfo.privateKeyEncrypted,
      wallet_balance: 0,
      max_discussion_rounds: config.maxDiscussionRounds || 3,
      round_timeout: config.roundTimeout || 300,
      consensus_algorithm: config.consensusAlgorithm || 'majority',
      enable_discussion: config.enableDiscussion !== false,
      convergence_threshold: config.convergenceThreshold || 0.75,
      outlier_detection: config.outlierDetection !== false,
      rounds_completed: 0,
      rounds_total: 0,
      rounds_current: 0,
      hcs_topic_id: null,
      metadata: null,
    })

    // Add judges
    if (judgeIds.length > 0) {
      await OrchestratorJudgesModel.addJudges(orchestratorId, judgeIds)
    }

    return {
      success: true,
      orchestratorId,
      wallet: {
        accountId: walletInfo.accountId,
        address: walletInfo.evmAddress,
        balance: 0,
      },
    }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500)
    return { success: false, error: 'Failed to create orchestrator' }
  }
})
```

---

### PATCH /api/orchestrators/:id
Update an orchestrator.

**Request Body:**
```json
{
  "status": "active",
  "wallet_balance": 15.5,
  "hcs_topic_id": "0.0.123456"
}
```

**Implementation:**
```typescript
// PATCH /api/orchestrators/:id
fastify.patch<{
  Params: { id: string }
  Body: Partial<{
    name: string
    description: string
    status: 'active' | 'inactive' | 'pending'
    wallet_balance: number
    hcs_topic_id: string
    rounds_completed: number
    rounds_total: number
    rounds_current: number
  }>
}>('/api/orchestrators/:id', async (request, reply) => {
  try {
    const success = await OrchestratorsModel.update(request.params.id, request.body)

    if (!success) {
      reply.code(404)
      return { success: false, error: 'Orchestrator not found or no changes made' }
    }

    return { success: true }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500)
    return { success: false, error: 'Failed to update orchestrator' }
  }
})
```

---

### DELETE /api/orchestrators/:id
Delete an orchestrator.

**Implementation:**
```typescript
// DELETE /api/orchestrators/:id
fastify.delete<{ Params: { id: string } }>(
  '/api/orchestrators/:id',
  async (request, reply) => {
    try {
      const success = await OrchestratorsModel.delete(request.params.id)

      if (!success) {
        reply.code(404)
        return { success: false, error: 'Orchestrator not found' }
      }

      return { success: true }
    } catch (error) {
      fastify.log.error(error)
      reply.code(500)
      return { success: false, error: 'Failed to delete orchestrator' }
    }
  }
)
```

## Security Notes

- Never expose `wallet_private_key_encrypted` in API responses
- Validate user ownership before allowing updates/deletes
- The wallet private key should be encrypted with AES-256 before storage
