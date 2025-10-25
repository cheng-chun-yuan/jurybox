# Judges API Implementation

## Endpoints

### GET /api/judges
Get all active judges.

**Response:**
```json
{
  "success": true,
  "judges": [
    {
      "id": 1,
      "name": "Dr. Alex Chen",
      "title": "AI Researcher & Technical Expert",
      "tagline": ["Technical", "AI/ML"],
      "description": "AI researcher with deep expertise in machine learning...",
      "avatar": "/judges/alex-chen.jpg",
      "theme_color": "#8B5CF6",
      "specialties": ["AI/ML", "System Architecture", "Performance Optimization"],
      "model_provider": "OpenAI",
      "model_name": "gpt-4",
      "system_prompt": "You are Dr. Alex Chen...",
      "temperature": 0.70,
      "price": 0.050,
      "wallet_address": "0.0.123456",
      "payment_page_url": "https://payment.example.com/judge/1",
      "rating": 4.9,
      "total_judgments": 0,
      "ipfs_cid": "QmX1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v",
      "status": "active"
    }
  ]
}
```

**Implementation:**
```typescript
import { FastifyInstance } from 'fastify'
import { JudgesModel } from '../../lib/db/models'

export async function judgesRoutes(fastify: FastifyInstance) {
  // GET /api/judges
  fastify.get('/api/judges', async (request, reply) => {
    try {
      const judges = await JudgesModel.findAll()

      const parsedJudges = judges.map((judge) => ({
        ...judge,
        tagline: JSON.parse(judge.tagline || '[]'),
        specialties: JSON.parse(judge.specialties || '[]'),
      }))

      return { success: true, judges: parsedJudges }
    } catch (error) {
      fastify.log.error(error)
      reply.code(500)
      return { success: false, error: 'Failed to fetch judges' }
    }
  })
}
```

---

### GET /api/judges/:id
Get a specific judge by ID.

**Parameters:**
- `id` (number) - Judge ID

**Response:**
```json
{
  "success": true,
  "judge": {
    "id": 1,
    "name": "Dr. Alex Chen",
    "title": "AI Researcher & Technical Expert",
    "tagline": ["Technical", "AI/ML"],
    "specialties": ["AI/ML", "System Architecture"],
    "model_provider": "OpenAI",
    "model_name": "gpt-4",
    "temperature": 0.70,
    "price": 0.050,
    "wallet_address": "0.0.123456",
    "payment_page_url": "https://payment.example.com/judge/1",
    "ipfs_cid": "QmX1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v"
  }
}
```

**Implementation:**
```typescript
// GET /api/judges/:id
fastify.get<{ Params: { id: string } }>(
  '/api/judges/:id',
  async (request, reply) => {
    try {
      const judgeId = parseInt(request.params.id)
      if (isNaN(judgeId)) {
        reply.code(400)
        return { success: false, error: 'Invalid judge ID' }
      }

      const judge = await JudgesModel.findById(judgeId)

      if (!judge) {
        reply.code(404)
        return { success: false, error: 'Judge not found' }
      }

      return {
        success: true,
        judge: {
          ...judge,
          tagline: JSON.parse(judge.tagline || '[]'),
          specialties: JSON.parse(judge.specialties || '[]'),
        },
      }
    } catch (error) {
      fastify.log.error(error)
      reply.code(500)
      return { success: false, error: 'Failed to fetch judge' }
    }
  }
)
```

---

### POST /api/judges
Create a new judge (admin only).

**Request Body:**
```json
{
  "name": "Dr. Academic",
  "title": "Research Specialist",
  "tagline": ["Academic", "Research"],
  "description": "Expert researcher with...",
  "avatar": "/judges/avatar.jpg",
  "themeColor": "#8B5CF6",
  "specialties": ["Research Methodology", "Academic Writing"],
  "modelProvider": "OpenAI",
  "modelName": "gpt-4",
  "systemPrompt": "You are an expert...",
  "temperature": 0.70,
  "price": 0.05,
  "walletAddress": "0.0.123456",
  "ipfsCid": "QmX1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v"
}
```

**Response:**
```json
{
  "success": true,
  "judgeId": 6,
  "registryTxHash": "0.0.123456@1234567890.123456789",
  "paymentPageUrl": "https://yourdomain.com/api/pay/judge/6"
}
```

**Implementation:**
```typescript
// POST /api/judges
fastify.post<{
  Body: {
    name: string
    title?: string
    tagline?: string[]
    description?: string
    avatar?: string
    themeColor?: string
    specialties?: string[]
    modelProvider?: string
    modelName?: string
    systemPrompt: string
    temperature?: number
    price?: number
    walletAddress?: string
    ipfsCid?: string
  }
}>('/api/judges', async (request, reply) => {
  try {
    const {
      name,
      title,
      tagline,
      description,
      avatar,
      themeColor,
      specialties,
      modelProvider,
      modelName,
      systemPrompt,
      temperature,
      price,
      walletAddress,
      ipfsCid,
    } = request.body

    if (!name || !systemPrompt) {
      reply.code(400)
      return { success: false, error: 'Name and system prompt are required' }
    }

    // TODO: Register agent on-chain and get transaction hash
    // This would be done using Hedera SDK to submit to HCS topic or smart contract
    let registryTxHash: string | null = null

    // Example: Register to Hedera (implement based on your contract)
    // const txHash = await registerAgentOnChain({ name, ipfsCid, ... })
    // registryTxHash = txHash

    const judgeId = await JudgesModel.create({
      name,
      title: title || null,
      tagline: JSON.stringify(tagline || []),
      description: description || null,
      avatar: avatar || null,
      theme_color: themeColor || '#8B5CF6',
      specialties: JSON.stringify(specialties || []),
      model_provider: modelProvider || 'OpenAI',
      model_name: modelName || 'gpt-4',
      system_prompt: systemPrompt,
      temperature: temperature || 0.70,
      price: price || 0.05,
      wallet_address: walletAddress || null,
      payment_page_url: null, // Will be generated after creation
      rating: 0,
      total_judgments: 0,
      ipfs_cid: ipfsCid || null,
      status: 'active',
    })

    // Generate payment page URL after judge is created
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:10000'
    const paymentPageUrl = `${backendUrl}/api/pay/judge/${judgeId}`

    // Update the judge with the generated payment page URL
    await JudgesModel.update(judgeId, {
      payment_page_url: paymentPageUrl,
    })

    // Return the transaction hash and payment URL in response
    return {
      success: true,
      judgeId,
      registryTxHash, // Frontend will console.log this
      paymentPageUrl, // Generated payment page URL
    }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500)
    return { success: false, error: 'Failed to create judge' }
  }
})
```

---

### PATCH /api/judges/:id
Update a judge (admin only).

**Request Body:**
```json
{
  "name": "Updated Name",
  "title": "Senior Researcher",
  "temperature": 0.75,
  "price": 0.06,
  "status": "inactive"
}
```

**Response:**
```json
{
  "success": true
}
```

**Implementation:**
```typescript
// PATCH /api/judges/:id
fastify.patch<{
  Params: { id: string }
  Body: Partial<{
    name: string
    title: string
    tagline: string[]
    description: string
    avatar: string
    themeColor: string
    specialties: string[]
    modelProvider: string
    modelName: string
    systemPrompt: string
    temperature: number
    price: number
    rating: number
    status: 'active' | 'inactive'
  }>
}>('/api/judges/:id', async (request, reply) => {
  try {
    const judgeId = parseInt(request.params.id)
    if (isNaN(judgeId)) {
      reply.code(400)
      return { success: false, error: 'Invalid judge ID' }
    }

    const updates: any = {}
    const body = request.body

    if (body.name !== undefined) updates.name = body.name
    if (body.title !== undefined) updates.title = body.title
    if (body.tagline !== undefined) updates.tagline = JSON.stringify(body.tagline)
    if (body.description !== undefined) updates.description = body.description
    if (body.avatar !== undefined) updates.avatar = body.avatar
    if (body.themeColor !== undefined) updates.theme_color = body.themeColor
    if (body.specialties !== undefined) updates.specialties = JSON.stringify(body.specialties)
    if (body.modelProvider !== undefined) updates.model_provider = body.modelProvider
    if (body.modelName !== undefined) updates.model_name = body.modelName
    if (body.systemPrompt !== undefined) updates.system_prompt = body.systemPrompt
    if (body.temperature !== undefined) updates.temperature = body.temperature
    if (body.price !== undefined) updates.price = body.price
    if (body.rating !== undefined) updates.rating = body.rating
    if (body.status !== undefined) updates.status = body.status

    const success = await JudgesModel.update(judgeId, updates)

    if (!success) {
      reply.code(404)
      return { success: false, error: 'Judge not found or no changes made' }
    }

    return { success: true }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500)
    return { success: false, error: 'Failed to update judge' }
  }
})
```

## Usage Notes

- All judges are created with `rating: 0` and `total_judgments: 0`
- The `tagline` and `specialties` fields are stored as JSON strings in the database
- The `system_prompt` field contains the AI prompt for this judge
- Default `temperature` is 0.70, default `model_provider` is 'OpenAI', default `model_name` is 'gpt-4'
- Default `theme_color` is '#8B5CF6' (purple)
- Only `active` judges are returned by the GET all endpoint
- Price is per judgment in HBAR (default: 0.05)

## Payment Configuration

- `wallet_address`: Hedera account ID (e.g., "0.0.123456") or EVM address where the judge receives payments
  - This is provided by the user when creating the judge
  - Required for receiving payment for evaluations

- `payment_page_url`: Auto-generated X402/A2A payment page URL
  - **Automatically generated** by the backend after judge creation
  - Format: `{BACKEND_URL}/api/pay/judge/{judgeId}`
  - Example: `https://yourdomain.com/api/pay/judge/6`
  - This URL follows the [X402 Payment Protocol](https://github.com/hashgraph/hedera-improvement-proposal/blob/main/HIP/hip-402.md)
  - When users need to pay the judge, they can be redirected to this URL
  - The payment endpoint handles the actual HBAR transfer to the `wallet_address`
  - Not required in the create request - generated automatically

## Payment Flow

1. User creates a judge with `walletAddress`
2. Backend creates the judge and generates `paymentPageUrl`
3. Backend updates the judge record with the generated URL
4. Response includes both `judgeId` and `paymentPageUrl`
5. Frontend can display/use the payment URL for transactions
