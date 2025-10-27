# Orchestrator Test API Specification

Complete API specification for the orchestrator test endpoint with on-chain feedback support.

---

## 1. Test Evaluation Endpoint

### Endpoint
```
POST /api/orchestrator/test
```

### Request Body

```typescript
interface OrchestratorTestRequest {
  agentIds: number[]              // Array of selected judge IDs from database
  maxRounds: number               // Maximum consensus rounds (default: 2-3)
  consensusAlgorithm: string      // Algorithm: "weighted_average" | "median" | "majority"
  content: string                 // The content/submission to be evaluated
  criteria: string[]              // Evaluation criteria (e.g., ["Accuracy", "Clarity", "Completeness", "Relevance"])
  userWalletAddress: string       // User's EVM wallet address (for feedback authorization)
}
```

### Example Request

```json
{
  "agentIds": [13, 14, 18],
  "maxRounds": 2,
  "consensusAlgorithm": "weighted_average",
  "content": "Blockchain technology enables decentralized trust through cryptographic verification and distributed consensus mechanisms. Smart contracts automate agreement execution without intermediaries.",
  "criteria": ["Accuracy", "Clarity", "Completeness", "Relevance"],
  "userWalletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3001/api/orchestrator/test \
  -H "Content-Type: application/json" \
  -d '{
    "agentIds": [13, 14, 18],
    "maxRounds": 2,
    "consensusAlgorithm": "weighted_average",
    "content": "Blockchain technology enables decentralized trust...",
    "criteria": ["Accuracy", "Clarity", "Completeness", "Relevance"],
    "userWalletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  }'
```

---

## 2. Response Structure

### Success Response

```typescript
interface OrchestratorTestResponse {
  success: true
  evaluationId: number            // Database evaluation record ID
  topicId: string                 // Hedera HCS topic ID (e.g., "0.0.12345")
  consensusScore: number          // Final consensus score (0-10)
  totalRounds: number             // Number of rounds executed
  judges: JudgeEvaluation[]       // Array of judge evaluations with feedback auth
  hcsMessages?: HCSMessage[]      // Optional: Initial HCS messages
  metadata: {
    timestamp: number             // Unix timestamp of evaluation start
    algorithm: string             // Consensus algorithm used
    criteria: string[]            // Criteria used for evaluation
  }
}

interface JudgeEvaluation {
  // Judge Identity
  id: number                      // Judge ID from database
  agentId: number                 // Same as id (alias for compatibility)
  registryAgentId: number         // On-chain registry agent ID (for smart contract)
  name: string                    // Judge name
  title: string                   // Judge title/role
  avatar?: string                 // Judge avatar URL

  // Evaluation Results
  score: number                   // Judge's final score (0-10)
  feedback: string                // Detailed evaluation feedback
  reasoning?: string              // Optional: Judge's reasoning

  // Round-by-Round Breakdown
  rounds: RoundEvaluation[]       // Evaluation for each consensus round

  // On-Chain Feedback Support
  feedbackAuth: string            // Pre-signed feedback authorization (0x...)
  ipfsUri: string                 // IPFS URI for judge's evaluation data
  ipfsHash: string                // Keccak256 hash of IPFS content (0x...)

  // Metadata
  evaluatedAt: string             // ISO timestamp of evaluation
  modelProvider?: string          // AI model provider (e.g., "openai")
  modelName?: string              // AI model name (e.g., "gpt-4")
}

interface RoundEvaluation {
  roundNumber: number             // Round number (1, 2, 3...)
  score: number                   // Score for this round
  feedback: string                // Feedback for this round
  timestamp: string               // ISO timestamp
  consensusScore?: number         // Current consensus score after this round
}

interface HCSMessage {
  consensus_timestamp: string     // HCS consensus timestamp
  sequence_number: number         // Message sequence number
  message: string                 // Base64 encoded message
  decoded?: string                // Decoded message content
  parsedData?: any                // Parsed JSON data from message
}
```

### Example Response

```json
{
  "success": true,
  "evaluationId": 456,
  "topicId": "0.0.5094321",
  "consensusScore": 8.2,
  "totalRounds": 2,
  "metadata": {
    "timestamp": 1699999999999,
    "algorithm": "weighted_average",
    "criteria": ["Accuracy", "Clarity", "Completeness", "Relevance"]
  },
  "judges": [
    {
      "id": 13,
      "agentId": 13,
      "registryAgentId": 13,
      "name": "Dr. Academic",
      "title": "Research Specialist",
      "avatar": "ipfs://QmAbc123.../avatar.png",
      "score": 8.5,
      "feedback": "The content demonstrates strong technical accuracy and provides clear explanations of blockchain fundamentals. The discussion of cryptographic verification and consensus mechanisms is well-articulated. However, could benefit from more specific examples of real-world applications.",
      "reasoning": "Content shows deep understanding of core concepts with room for practical context.",
      "rounds": [
        {
          "roundNumber": 1,
          "score": 8.0,
          "feedback": "Good technical foundation, needs more examples.",
          "timestamp": "2024-11-15T10:30:00Z",
          "consensusScore": 7.8
        },
        {
          "roundNumber": 2,
          "score": 8.5,
          "feedback": "Improved clarity after consensus round. Strong overall.",
          "timestamp": "2024-11-15T10:31:30Z",
          "consensusScore": 8.2
        }
      ],
      "feedbackAuth": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
      "ipfsUri": "ipfs://QmXYZ789.../evaluation-456-judge-13.json",
      "ipfsHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      "evaluatedAt": "2024-11-15T10:31:30Z",
      "modelProvider": "openai",
      "modelName": "gpt-4"
    },
    {
      "id": 14,
      "agentId": 14,
      "registryAgentId": 14,
      "name": "Tech Guru",
      "title": "Senior Developer",
      "avatar": "ipfs://QmDef456.../avatar.png",
      "score": 7.8,
      "feedback": "Solid technical content with accurate descriptions. The explanation of smart contracts is particularly good. Would like to see more discussion of scalability challenges and potential limitations.",
      "reasoning": "Technically sound but could explore edge cases and challenges.",
      "rounds": [
        {
          "roundNumber": 1,
          "score": 7.5,
          "feedback": "Good basics, missing scalability discussion.",
          "timestamp": "2024-11-15T10:30:05Z",
          "consensusScore": 7.8
        },
        {
          "roundNumber": 2,
          "score": 7.8,
          "feedback": "Maintains quality, consensus reached.",
          "timestamp": "2024-11-15T10:31:35Z",
          "consensusScore": 8.2
        }
      ],
      "feedbackAuth": "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
      "ipfsUri": "ipfs://QmABC123.../evaluation-456-judge-14.json",
      "ipfsHash": "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba98",
      "evaluatedAt": "2024-11-15T10:31:35Z",
      "modelProvider": "anthropic",
      "modelName": "claude-3-opus"
    },
    {
      "id": 18,
      "agentId": 18,
      "registryAgentId": 18,
      "name": "Business Strategist",
      "title": "Market Analyst",
      "avatar": "ipfs://QmGhi789.../avatar.png",
      "score": 8.3,
      "feedback": "Excellent foundational explanation with strong technical merit. The practical implications for business use cases could be expanded. Overall, a well-structured and informative piece.",
      "reasoning": "Strong technical content with opportunities for business context.",
      "rounds": [
        {
          "roundNumber": 1,
          "score": 8.0,
          "feedback": "Good technical foundation, add business applications.",
          "timestamp": "2024-11-15T10:30:10Z",
          "consensusScore": 7.8
        },
        {
          "roundNumber": 2,
          "score": 8.3,
          "feedback": "Balanced evaluation, consensus achieved.",
          "timestamp": "2024-11-15T10:31:40Z",
          "consensusScore": 8.2
        }
      ],
      "feedbackAuth": "0xaabbccdd11223344aabbccdd11223344aabbccdd11223344aabbccdd11223344aabbccdd11223344aabbccdd11223344aabbccdd11223344aabbccdd11223344",
      "ipfsUri": "ipfs://QmDEF456.../evaluation-456-judge-18.json",
      "ipfsHash": "0x1122334455667788112233445566778811223344556677881122334455667788",
      "evaluatedAt": "2024-11-15T10:31:40Z",
      "modelProvider": "openai",
      "modelName": "gpt-4-turbo"
    }
  ],
  "hcsMessages": [
    {
      "consensus_timestamp": "1699999999.123456789",
      "sequence_number": 1,
      "message": "eyJ0eXBlIjoicm91bmQiLCJyb3VuZE51bWJlciI6MSwic2NvcmUiOjcuOH0=",
      "decoded": "{\"type\":\"round\",\"roundNumber\":1,\"score\":7.8}",
      "parsedData": {
        "type": "round",
        "roundNumber": 1,
        "score": 7.8
      }
    }
  ]
}
```

### Error Response

```typescript
interface OrchestratorTestError {
  success: false
  error: string                   // Error message
  code?: string                   // Error code (e.g., "INVALID_AGENTS", "CONSENSUS_FAILED")
  details?: any                   // Additional error details
}
```

```json
{
  "success": false,
  "error": "One or more agent IDs are invalid",
  "code": "INVALID_AGENTS",
  "details": {
    "invalidIds": [99],
    "validIds": [13, 14, 18]
  }
}
```

---

## 3. Frontend Data Aggregation

### Processing the Response

```typescript
// app/submit/page.tsx - Example aggregation logic

const processTestResults = (data: OrchestratorTestResponse) => {
  // 1. Store complete test results
  setTestResults(data)

  // 2. Extract consensus score
  setFinalConsensusScore(data.consensusScore)

  // 3. Extract current round
  setCurrentRound(data.totalRounds)

  // 4. Start HCS polling if topic available
  if (data.topicId) {
    setIsPolling(true)
    pollHCSMessages(data.topicId)
  }

  // 5. Process individual judge data
  data.judges.forEach(judge => {
    console.log(`Judge ${judge.name} (ID: ${judge.id}):`)
    console.log(`  - Score: ${judge.score}/10`)
    console.log(`  - Registry Agent ID: ${judge.registryAgentId}`)
    console.log(`  - Feedback Auth: ${judge.feedbackAuth.slice(0, 20)}...`)
    console.log(`  - IPFS URI: ${judge.ipfsUri}`)
    console.log(`  - Ready for on-chain feedback: ${!!judge.feedbackAuth}`)
  })
}
```

### Displaying Judge Cards

```tsx
{testResults?.judges?.map((judge: JudgeEvaluation) => {
  const judgeId = judge.id ?? judge.agentId
  const selectedJudge = selectedJudges.find(j => j.id === judgeId)

  return (
    <Card key={judgeId} className="p-6">
      {/* Judge Header */}
      <div className="flex items-center gap-4">
        <img src={judge.avatar} alt={judge.name} className="w-16 h-16 rounded-full" />
        <div>
          <h3 className="text-xl font-semibold">{judge.name}</h3>
          <p className="text-sm text-foreground/60">{judge.title}</p>
        </div>
        <div className="ml-auto">
          <div className="text-3xl font-bold text-brand-purple">
            {judge.score.toFixed(1)}
          </div>
          <div className="text-xs text-foreground/60">Score</div>
        </div>
      </div>

      {/* Evaluation Feedback */}
      <div className="mt-4 p-4 bg-surface-2/50 rounded-lg">
        <p className="text-sm">{judge.feedback}</p>
      </div>

      {/* Round Breakdown */}
      <div className="mt-4 space-y-2">
        {judge.rounds?.map((round, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm p-2 bg-surface-2/30 rounded">
            <span>Round {round.roundNumber}</span>
            <span className="font-medium">{round.score}/10</span>
          </div>
        ))}
      </div>

      {/* On-Chain Feedback Section */}
      {judge.feedbackAuth && (
        <div className="mt-6 p-4 border-t border-border/30">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Leave On-Chain Feedback
          </h4>

          {/* Star Rating */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => setJudgeFeedback(prev => ({
                  ...prev,
                  [judgeId]: {
                    ...prev[judgeId],
                    rating,
                    tags: prev[judgeId]?.tags || []
                  }
                }))}
              >
                <Star
                  className={
                    rating <= (judgeFeedback[judgeId]?.rating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-400'
                  }
                />
              </button>
            ))}
            <span className="text-sm ml-2">
              {judgeFeedback[judgeId]?.rating || 0}/5
            </span>
          </div>

          {/* Comment */}
          <Textarea
            placeholder="Share your experience with this judge..."
            className="mt-3"
            value={judgeFeedback[judgeId]?.comment || ''}
            onChange={(e) => setJudgeFeedback(prev => ({
              ...prev,
              [judgeId]: {
                ...prev[judgeId],
                comment: e.target.value,
                tags: prev[judgeId]?.tags || []
              }
            }))}
          />

          {/* Submit Button */}
          <Button
            onClick={() => handleSubmitFeedback(judgeId)}
            disabled={!judgeFeedback[judgeId]?.rating}
            className="mt-3"
          >
            Submit On-Chain Feedback
          </Button>
        </div>
      )}
    </Card>
  )
})}
```

### Consensus Score Display

```tsx
{/* Display final consensus score prominently */}
{testResults && (
  <div className="mb-8 p-6 bg-gradient-to-br from-brand-purple/20 to-brand-cyan/20 rounded-xl border border-brand-purple/30">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground/70">Final Consensus Score</h3>
        <p className="text-sm text-foreground/60">
          Based on {testResults.totalRounds} round{testResults.totalRounds > 1 ? 's' : ''} of evaluation
        </p>
      </div>
      <div className="text-5xl font-bold text-brand-purple">
        {testResults.consensusScore.toFixed(1)}
        <span className="text-2xl text-foreground/60">/10</span>
      </div>
    </div>

    {/* Metadata */}
    <div className="mt-4 flex gap-4 text-xs text-foreground/60">
      <span>Algorithm: {testResults.metadata.algorithm}</span>
      <span>•</span>
      <span>Judges: {testResults.judges.length}</span>
      <span>•</span>
      <span>Topic: {testResults.topicId}</span>
    </div>
  </div>
)}
```

---

## 4. On-Chain Feedback Flow

### Complete Flow with Response Data

```typescript
const handleSubmitFeedback = async (judgeId: number) => {
  // 1. Get judge data from test results
  const judge = testResults.judges.find(j => j.id === judgeId || j.agentId === judgeId)
  if (!judge) {
    alert('Judge data not found')
    return
  }

  // 2. Validate feedbackAuth is available
  if (!judge.feedbackAuth || !judge.registryAgentId || !judge.ipfsUri || !judge.ipfsHash) {
    alert('Feedback authorization not available from test results')
    return
  }

  // 3. Get user's feedback
  const feedback = judgeFeedback[judgeId]
  if (!feedback?.rating) {
    alert('Please provide a rating')
    return
  }

  // 4. Convert rating to score (1-5 stars → 0-100)
  const score = Math.floor((feedback.rating / 5) * 100)

  // 5. Convert tags to bytes32
  const tags = feedback.tags || []
  const tag1 = tags[0] ? keccak256(toHex(tags[0])) : keccak256(toHex('general'))
  const tag2 = tags[1] ? keccak256(toHex(tags[1])) : keccak256(toHex('evaluation'))

  // 6. Upload user feedback to IPFS (optional - could use judge's ipfsUri/ipfsHash)
  const userFeedbackData = {
    rating: feedback.rating,
    score: score,
    comment: feedback.comment,
    tags: feedback.tags || [],
    judgeId,
    evaluationId: testResults.evaluationId,
    timestamp: Date.now(),
    userAddress: address
  }

  const ipfsResponse = await fetch(`${BACKEND_URL}/api/upload-feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userFeedbackData),
  })

  const { ipfsUri, ipfsHash } = await ipfsResponse.json()

  // 7. Call smart contract using data from test results
  writeFeedback({
    address: CONTRACT_ADDRESSES.ReputationRegistry,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: 'giveFeedback',
    args: [
      BigInt(judge.registryAgentId),  // From test results
      score,                           // Calculated from user rating
      tag1,                            // User's tag 1
      tag2,                            // User's tag 2
      ipfsUri,                         // New IPFS URI for user feedback
      ipfsHash,                        // New IPFS hash for user feedback
      judge.feedbackAuth               // Pre-signed auth from test results
    ],
  })
}
```

---

## 5. Backend Implementation Guide

### Key Requirements

1. **Generate feedbackAuth for each judge**
   - Sign feedback hash with agent owner's private key
   - Include in response immediately with test results
   - Format: `0x` prefixed hex string (132 chars)

2. **Upload judge evaluation to IPFS**
   - Store detailed evaluation data
   - Return IPFS URI and keccak256 hash
   - Include in judge object

3. **Return registryAgentId**
   - On-chain agent ID from Identity Registry
   - Required for smart contract calls
   - Must match judge's registered ID

4. **Process consensus rounds**
   - Execute multiple rounds based on maxRounds
   - Calculate consensus score using specified algorithm
   - Store round-by-round data in rounds array

5. **Post to HCS topic**
   - Create or use existing HCS topic
   - Post evaluation messages to topic
   - Return topicId for frontend polling

### Example Backend Implementation

```typescript
// backend/routes/orchestrator.ts

app.post('/api/orchestrator/test', async (req, res) => {
  const { agentIds, maxRounds, consensusAlgorithm, content, criteria, userWalletAddress } = req.body

  try {
    // 1. Load judges from database
    const judges = await db.query('SELECT * FROM judges WHERE id IN (?)', [agentIds])

    // 2. Execute orchestrator evaluation
    const orchestrator = new OrchestratorService()
    const evaluation = await orchestrator.evaluate({
      judges,
      content,
      criteria,
      maxRounds,
      algorithm: consensusAlgorithm
    })

    // 3. For each judge, prepare on-chain feedback data
    const judgesWithAuth = await Promise.all(judges.map(async (judge) => {
      // Get judge's evaluation from orchestrator
      const judgeEval = evaluation.judgeResults.find(r => r.judgeId === judge.id)

      // Upload evaluation to IPFS
      const ipfsData = {
        judgeId: judge.id,
        judgeName: judge.name,
        evaluation: judgeEval.feedback,
        score: judgeEval.score,
        rounds: judgeEval.rounds,
        timestamp: Date.now()
      }
      const { ipfsUri, ipfsHash } = await uploadToIPFS(ipfsData)

      // Generate feedbackAuth signature
      const agentOwnerWallet = getJudgeOwnerWallet(judge.id)
      const feedbackAuth = await agentOwnerWallet.signMessage(ipfsHash)

      return {
        id: judge.id,
        agentId: judge.id,
        registryAgentId: judge.registry_agent_id,
        name: judge.name,
        title: judge.title,
        avatar: judge.avatar,
        score: judgeEval.score,
        feedback: judgeEval.feedback,
        reasoning: judgeEval.reasoning,
        rounds: judgeEval.rounds,
        feedbackAuth,
        ipfsUri,
        ipfsHash,
        evaluatedAt: new Date().toISOString(),
        modelProvider: judge.model_provider,
        modelName: judge.model_name
      }
    }))

    // 4. Post to HCS
    const topicId = await postToHCS(evaluation)

    // 5. Return complete response
    res.json({
      success: true,
      evaluationId: evaluation.id,
      topicId,
      consensusScore: evaluation.consensusScore,
      totalRounds: evaluation.totalRounds,
      metadata: {
        timestamp: Date.now(),
        algorithm: consensusAlgorithm,
        criteria
      },
      judges: judgesWithAuth
    })

  } catch (error) {
    console.error('Orchestrator test error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'ORCHESTRATOR_ERROR'
    })
  }
})
```

---

## 6. Validation Rules

### Request Validation

```typescript
const validateTestRequest = (req: OrchestratorTestRequest): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Agent IDs
  if (!req.agentIds || !Array.isArray(req.agentIds) || req.agentIds.length === 0) {
    errors.push('agentIds must be a non-empty array')
  }
  if (req.agentIds.length > 10) {
    errors.push('Maximum 10 judges allowed per evaluation')
  }

  // Max Rounds
  if (!req.maxRounds || req.maxRounds < 1 || req.maxRounds > 5) {
    errors.push('maxRounds must be between 1 and 5')
  }

  // Consensus Algorithm
  const validAlgorithms = ['weighted_average', 'median', 'majority', 'unanimous']
  if (!validAlgorithms.includes(req.consensusAlgorithm)) {
    errors.push(`consensusAlgorithm must be one of: ${validAlgorithms.join(', ')}`)
  }

  // Content
  if (!req.content || req.content.trim().length === 0) {
    errors.push('content cannot be empty')
  }
  if (req.content.length > 10000) {
    errors.push('content must be less than 10,000 characters')
  }

  // Criteria
  if (!req.criteria || !Array.isArray(req.criteria) || req.criteria.length === 0) {
    errors.push('criteria must be a non-empty array')
  }
  if (req.criteria.length > 10) {
    errors.push('Maximum 10 criteria allowed')
  }

  // User Wallet Address
  if (!req.userWalletAddress || !req.userWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    errors.push('userWalletAddress must be a valid EVM address')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

---

## 7. TypeScript Types Export

```typescript
// types/orchestrator.ts

export interface OrchestratorTestRequest {
  agentIds: number[]
  maxRounds: number
  consensusAlgorithm: 'weighted_average' | 'median' | 'majority' | 'unanimous'
  content: string
  criteria: string[]
  userWalletAddress: string
}

export interface OrchestratorTestResponse {
  success: true
  evaluationId: number
  topicId: string
  consensusScore: number
  totalRounds: number
  judges: JudgeEvaluation[]
  hcsMessages?: HCSMessage[]
  metadata: {
    timestamp: number
    algorithm: string
    criteria: string[]
  }
}

export interface JudgeEvaluation {
  id: number
  agentId: number
  registryAgentId: number
  name: string
  title: string
  avatar?: string
  score: number
  feedback: string
  reasoning?: string
  rounds: RoundEvaluation[]
  feedbackAuth: string
  ipfsUri: string
  ipfsHash: string
  evaluatedAt: string
  modelProvider?: string
  modelName?: string
}

export interface RoundEvaluation {
  roundNumber: number
  score: number
  feedback: string
  timestamp: string
  consensusScore?: number
}

export interface HCSMessage {
  consensus_timestamp: string
  sequence_number: number
  message: string
  decoded?: string
  parsedData?: any
}

export interface OrchestratorTestError {
  success: false
  error: string
  code?: string
  details?: any
}
```

---

## 8. Testing Checklist

- [ ] Validate request body fields
- [ ] Handle invalid agent IDs gracefully
- [ ] Execute consensus rounds correctly
- [ ] Calculate consensus score using specified algorithm
- [ ] Generate valid feedbackAuth signatures
- [ ] Upload evaluation data to IPFS successfully
- [ ] Return correct registryAgentId for each judge
- [ ] Post messages to HCS topic
- [ ] Include round-by-round breakdown
- [ ] Handle errors with appropriate status codes
- [ ] Return proper TypeScript types
- [ ] Support all consensus algorithms
- [ ] Validate userWalletAddress format
- [ ] Store evaluation in database with correct evaluationId

---

## 9. Common Error Scenarios

### Invalid Agent IDs
```json
{
  "success": false,
  "error": "Agent IDs [99, 100] not found in database",
  "code": "INVALID_AGENTS"
}
```

### Consensus Failure
```json
{
  "success": false,
  "error": "Failed to reach consensus after 3 rounds",
  "code": "CONSENSUS_TIMEOUT",
  "details": {
    "roundsCompleted": 3,
    "scoresRange": [6.5, 9.2]
  }
}
```

### IPFS Upload Failure
```json
{
  "success": false,
  "error": "Failed to upload evaluation data to IPFS",
  "code": "IPFS_ERROR",
  "details": {
    "judgeId": 13,
    "ipfsError": "Connection timeout"
  }
}
```

### Missing Wallet Private Key
```json
{
  "success": false,
  "error": "Agent owner wallet not configured for judge ID 13",
  "code": "WALLET_CONFIG_ERROR"
}
```

---

## Summary

This specification provides:

1. ✅ **Complete API contract** for orchestrator test endpoint
2. ✅ **Detailed response structure** with all fields frontend needs
3. ✅ **On-chain feedback support** via feedbackAuth, ipfsUri, ipfsHash
4. ✅ **Frontend aggregation examples** for UI display
5. ✅ **Backend implementation guide** with code examples
6. ✅ **Validation rules** for request/response
7. ✅ **TypeScript types** for type safety
8. ✅ **Error handling** patterns
9. ✅ **Testing checklist** for implementation verification

**Key Points:**
- Backend MUST include `feedbackAuth`, `registryAgentId`, `ipfsUri`, `ipfsHash` in each judge object
- Frontend uses this data to submit on-chain feedback without additional API calls
- All signatures and hashes must be properly formatted hex strings with `0x` prefix
- IPFS URIs should use `ipfs://` protocol
