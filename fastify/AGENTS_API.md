# Agents API Implementation

## Endpoints

### GET /api/orchestrators/:orchestratorId/agents
Get all agents for a specific orchestrator.

**Response:**
```json
{
  "success": true,
  "agents": [
    {
      "id": "agent_xyz789",
      "orchestrator_id": "orch_abc123",
      "judge_id": 1,
      "name": "Technical Evaluator Agent",
      "role": "evaluator",
      "status": "active",
      "total_evaluations": 5,
      "average_score": 8.5,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Implementation:**
```typescript
import { FastifyInstance } from 'fastify'
import { AgentsModel, JudgesModel } from '../../lib/db/models'
import { nanoid } from 'nanoid'

export async function agentsRoutes(fastify: FastifyInstance) {
  // GET /api/orchestrators/:orchestratorId/agents
  fastify.get<{ Params: { orchestratorId: string } }>(
    '/api/orchestrators/:orchestratorId/agents',
    async (request, reply) => {
      try {
        const agents = await AgentsModel.findByOrchestratorId(request.params.orchestratorId)

        return { success: true, agents }
      } catch (error) {
        fastify.log.error(error)
        reply.code(500)
        return { success: false, error: 'Failed to fetch agents' }
      }
    }
  )
}
```

---

### GET /api/agents/:id
Get a specific agent.

**Response:**
```json
{
  "success": true,
  "agent": {
    "id": "agent_xyz789",
    "orchestrator_id": "orch_abc123",
    "judge_id": 1,
    "judge": {
      "id": 1,
      "name": "Dr. Alex Chen",
      "specialty": "Technical"
    },
    "name": "Technical Evaluator Agent",
    "status": "active"
  }
}
```

**Implementation:**
```typescript
// GET /api/agents/:id
fastify.get<{ Params: { id: string } }>(
  '/api/agents/:id',
  async (request, reply) => {
    try {
      const agent = await AgentsModel.findById(request.params.id)

      if (!agent) {
        reply.code(404)
        return { success: false, error: 'Agent not found' }
      }

      // Get judge info
      const judge = await JudgesModel.findById(agent.judge_id)

      return {
        success: true,
        agent: {
          ...agent,
          judge: judge
            ? {
                id: judge.id,
                name: judge.name,
                specialty: judge.specialty,
                expertise: JSON.parse(judge.expertise || '[]'),
              }
            : null,
        },
      }
    } catch (error) {
      fastify.log.error(error)
      reply.code(500)
      return { success: false, error: 'Failed to fetch agent' }
    }
  }
)
```

---

### POST /api/agents
Create a new agent.

**Request Body:**
```json
{
  "orchestratorId": "orch_abc123",
  "judgeId": 1,
  "name": "Technical Evaluator Agent",
  "role": "evaluator"
}
```

**Response:**
```json
{
  "success": true,
  "agentId": "agent_xyz789"
}
```

**Implementation:**
```typescript
// POST /api/agents
fastify.post<{
  Body: {
    orchestratorId: string
    judgeId: number
    name: string
    role?: string
  }
}>('/api/agents', async (request, reply) => {
  try {
    const { orchestratorId, judgeId, name, role } = request.body

    if (!orchestratorId || !judgeId || !name) {
      reply.code(400)
      return { success: false, error: 'Orchestrator ID, judge ID, and name are required' }
    }

    // Verify judge exists
    const judge = await JudgesModel.findById(judgeId)
    if (!judge) {
      reply.code(400)
      return { success: false, error: 'Invalid judge ID' }
    }

    const agentId = `agent_${nanoid(16)}`

    await AgentsModel.create({
      id: agentId,
      orchestrator_id: orchestratorId,
      judge_id: judgeId,
      name,
      role: role || null,
      status: 'active',
      agent_wallet_account_id: null,
      agent_wallet_evm_address: null,
      total_evaluations: 0,
      average_score: 0,
    })

    return { success: true, agentId }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500)
    return { success: false, error: 'Failed to create agent' }
  }
})
```

---

### PATCH /api/agents/:id
Update an agent.

**Request Body:**
```json
{
  "status": "inactive",
  "total_evaluations": 10,
  "average_score": 8.7
}
```

**Implementation:**
```typescript
// PATCH /api/agents/:id
fastify.patch<{
  Params: { id: string }
  Body: Partial<{
    name: string
    role: string
    status: 'active' | 'inactive' | 'busy'
    total_evaluations: number
    average_score: number
  }>
}>('/api/agents/:id', async (request, reply) => {
  try {
    const success = await AgentsModel.update(request.params.id, request.body)

    if (!success) {
      reply.code(404)
      return { success: false, error: 'Agent not found or no changes made' }
    }

    return { success: true }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500)
    return { success: false, error: 'Failed to update agent' }
  }
})
```

---

### DELETE /api/agents/:id
Delete an agent.

**Implementation:**
```typescript
// DELETE /api/agents/:id
fastify.delete<{ Params: { id: string } }>(
  '/api/agents/:id',
  async (request, reply) => {
    try {
      const success = await AgentsModel.delete(request.params.id)

      if (!success) {
        reply.code(404)
        return { success: false, error: 'Agent not found' }
      }

      return { success: true }
    } catch (error) {
      fastify.log.error(error)
      reply.code(500)
      return { success: false, error: 'Failed to delete agent' }
    }
  }
)
```

## Agent Lifecycle

1. **Creation**: Agents are created when an orchestrator is initialized with judges
2. **Active**: Agent is ready to participate in evaluations
3. **Busy**: Agent is currently processing an evaluation
4. **Inactive**: Agent has been deactivated

## Metrics Tracking

Agents track:
- `total_evaluations`: Number of evaluations completed
- `average_score`: Average score given across all evaluations

These should be updated after each evaluation is completed.
