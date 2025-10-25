## Orchestrator API and Input/Output Spec

This document defines how to construct orchestrator inputs, what the orchestrator returns, how to run a local judge test using a prompt/document, and how to expose a full conversation transcript for transparency. It aligns with the existing types in `types/agent.ts` and the current Hedera services under `lib/hedera/`.

### Goals
- Define required input structures for an evaluation
- Provide a reference configuration for the orchestrator
- Show how to run a judge test with a sample prompt/document
- Define expected outputs including consensus, per-judge results, and a full transparent chat transcript
- Indicate where to surface the transcript in the UI and how to link to HCS

---

## 1) Core Types (source of truth)

The orchestrator operates over these existing platform types:

```typescript
// From types/agent.ts
export interface OrchestratorConfig {
  maxDiscussionRounds: number
  roundTimeout: number
  consensusAlgorithm: 'simple_average' | 'weighted_average' | 'median'
  enableDiscussion: boolean
  convergenceThreshold: number
  outlierDetection: boolean
}

export interface OrchestratorWallet {
  address: string
  accountId: string
  publicKey: string
  privateKey: string // Encrypted in backend
  balance: number
  isActive: boolean
  createdAt: number
  lastUsed: number
}

export interface WalletCreationRequest {
  userAddress: string
  orchestratorId: string
  network: 'testnet' | 'mainnet'
  initialFunding?: number // HBAR amount for initial funding
}

export interface JudgmentRequest {
  id: string
  content: string
  criteria?: string[]
  selectedAgents: Agent[]
  requestedBy: string
  userAddress: string // Required for AA wallet association
  orchestratorWallet?: OrchestratorWallet // Optional, will be created if not provided
  createdAt: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface EvaluationProgress {
  status: 'initializing' | 'scoring' | 'discussing' | 'converging' | 'completed' | 'failed'
  currentRound: number
  totalRounds: number
  scoresReceived: number
  totalAgents: number
  topicId?: string
  currentScores?: Record<string, number>
  variance?: number
}

export interface ConsensusResult {
  finalScore: number
  algorithm: string
  individualScores: Record<string, number>
  weights?: Record<string, number>
  confidence: number
  variance: number
  convergenceRounds: number
}
```

Hedera integration used by the orchestrator is available via:
- `lib/hedera/agent-service.ts` (HCS topics, messages, account ops)
- `lib/hedera/viem-integration.ts` (EVM-compatible ops for Hedera)

---

## 2) Orchestrator Input Shape

Minimum viable input to kick off an evaluation:

```json
{
  "request": {
    "id": "req-001",
    "content": "Paste your prompt or document here...",
    "criteria": ["Accuracy", "Clarity", "Technical Depth"],
    "selectedAgents": [
      {
        "id": "agent-1",
        "name": "GrammarExpert",
        "title": "Grammar and Style Expert",
        "tagline": "",
        "bio": "",
        "avatar": "",
        "color": "purple",
        "hederaAccount": { "accountId": "0.0.12345", "publicKey": "...", "balance": 10 },
        "paymentConfig": { "enabled": true, "acceptedTokens": ["HBAR"], "pricePerJudgment": 0.5, "paymentAddress": "0x.." },
        "identity": { "registryId": "0x..", "agentId": "agent-1", "verified": true, "registeredAt": 0 },
        "reputation": { "totalReviews": 10, "averageRating": 8.9, "completedJudgments": 9, "successRate": 0.95, "lastUpdated": 0 },
        "capabilities": { "specialties": ["grammar"], "languages": ["en"], "modelProvider": "openai", "modelName": "gpt-4o", "systemPrompt": "You are a grammar expert." },
        "createdBy": "system",
        "createdAt": 0,
        "updatedAt": 0,
        "isActive": true
      }
    ],
    "requestedBy": "user-abc",
    "userAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "createdAt": 1730050000000,
    "status": "pending"
  },
  "config": {
    "maxDiscussionRounds": 3,
    "roundTimeout": 60000,
    "consensusAlgorithm": "weighted_average",
    "enableDiscussion": true,
    "convergenceThreshold": 0.5,
    "outlierDetection": true
  }
}
```

Notes:
- `content` is the raw prompt or document to be evaluated.
- `criteria` are optional; defaults may be provided by the orchestrator.
- `selectedAgents` should include Hedera and pricing details if payments are enabled.
- `userAddress` is required for AA wallet creation and association.
- `orchestratorWallet` is optional; if not provided, the backend will create a new AA wallet for this evaluation.

---

## 3) Account Abstraction (AA) Wallet Management

Each orchestrator instance requires its own AA wallet for secure transaction management and payment processing.

### Orchestrator Creation Flow

```typescript
// Backend API endpoint for orchestrator creation
POST /api/orchestrator/create
{
  "userAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "config": {
    "maxDiscussionRounds": 3,
    "roundTimeout": 60000,
    "consensusAlgorithm": "weighted_average",
    "enableDiscussion": true,
    "convergenceThreshold": 0.5,
    "outlierDetection": true
  },
  "systemPrompt": "You are an AI orchestrator managing a panel of expert judges...",
  "network": "testnet",
  "initialFunding": 10.0 // Optional HBAR amount
}

// Response
{
  "orchestratorId": "orch-001",
  "wallet": {
    "address": "0x...",
    "accountId": "0.0.12345",
    "publicKey": "...",
    "isActive": true,
    "createdAt": 1730050000000,
    "lastUsed": 1730050000000
  },
  "rounds": {
    "completed": 0,
    "total": 0,
    "current": 0
  },
  "fundingTxId": "0x..." // Transaction ID for initial funding
}
```

### Evaluation Request Flow

```typescript
// Backend API endpoint for evaluation execution
POST /api/orchestrator/evaluate
{
  "orchestratorId": "orch-001", // Created in previous step
  "request": {
    "id": "req-001",
    "content": "Paste your prompt or document here...",
    "criteria": ["Accuracy", "Clarity", "Technical Depth"],
    "selectedAgents": [
      {
        "id": "agent-1",
        "name": "GrammarExpert",
        // ... full agent details with Hedera account info
      }
    ],
    "requestedBy": "user-abc",
    "createdAt": 1730050000000,
    "status": "pending"
  }
}

// Response streams EvaluationProgress updates
```

### Wallet Management

- **Creation**: Backend creates AA wallet using user's address as controller
- **Storage**: Private keys encrypted and stored securely in backend
- **Funding**: User must interact with their wallet to approve HBAR transfer to AA wallet
- **Balance**: Always checked on-chain via Hedera Mirror Node API (no database storage)
- **Usage**: Orchestrator uses AA wallet for all HCS transactions and agent payments
- **Cleanup**: Wallet can be deactivated after evaluation completion

### Funding Flow

1. **User clicks "Fund"** → Frontend initiates wallet interaction
2. **Wallet opens** → User sees transaction details and approves
3. **Transaction sent** → HBAR transferred from user's wallet to AA wallet
4. **Backend notified** → Transaction hash recorded
5. **Redirect** → User taken to orchestrator dashboard

### On-Chain Balance Checking

**Endpoint:** `GET /api/orchestrator/{orchestratorId}/balance`

**Response:**
```typescript
{
  "balance": {
    "hbar": "10.5", // HBAR balance as string
    "tinybars": "1050000000", // Tinybars for precision
    "lastChecked": 1730050000000
  },
  "accountId": "0.0.12345",
  "address": "0x..."
}
```

**Implementation:**
- Backend calls Hedera Mirror Node API: `https://testnet.mirrornode.hedera.com/api/v1/accounts/{accountId}`
- Extracts balance from response: `data.balance.balance`
- Converts tinybars to HBAR: `balance / 100000000`
- No database storage of balance - always fresh from chain

### Round Management

**Endpoint:** `PUT /api/orchestrator/{orchestratorId}/rounds`

**Request:**
```typescript
{
  "action": "start" | "complete" | "reset",
  "totalRounds"?: number, // Required for "start" action
  "currentRound"?: number // Optional for "complete" action
}
```

**Response:**
```typescript
{
  "success": boolean,
  "rounds": {
    "completed": number,
    "total": number,
    "current": number
  },
  "message": string
}
```

**Implementation:**
- `start`: Initialize rounds for new evaluation (sets total, resets completed/current)
- `complete`: Mark current round as completed, increment counters
- `reset`: Reset all round counters to 0

## 5) Database Schema (Updated)

```sql
-- Orchestrators table
CREATE TABLE orchestrators (
  id VARCHAR(255) PRIMARY KEY,
  user_address VARCHAR(255) NOT NULL,
  system_prompt TEXT,
  config JSON,
  status VARCHAR(50) DEFAULT 'created',
  rounds_completed INT DEFAULT 0,
  rounds_total INT DEFAULT 0,
  rounds_current INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- AA Wallets table (no balance storage)
CREATE TABLE aa_wallets (
  id VARCHAR(255) PRIMARY KEY,
  orchestrator_id VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  public_key TEXT NOT NULL,
  private_key_encrypted TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orchestrator_id) REFERENCES orchestrators(id)
);
```

**Note:** Rounds are stored in the orchestrators table to track multi-agent evaluation progress.

### Security Considerations

- Private keys never exposed to frontend
- User address used for wallet control and recovery
- All transactions signed by orchestrator's AA wallet
- Audit trail maintained for all wallet operations

---

## 4) Conversation Transcript (Transparency)

The orchestrator should emit a complete chat transcript. Recommended shapes:

```typescript
export interface ConversationMessage {
  id: string
  role: 'system' | 'agent' | 'orchestrator'
  agentId?: string
  content: string
  timestamp: number
  phase: 'scoring' | 'discussion' | 'consensus'
  round?: number
  hcsTxId?: string // Hedera Consensus Service message transaction id
}

export interface EvaluationTranscript {
  topicId: string // HCS topic id
  rounds: Array<{
    round: number
    variance?: number
    messages: ConversationMessage[]
  }>
}
```

Publishing rules:
- Create an HCS topic at initialization (see `createAgentTopic` in `agent-service.ts`).
- Every message sent by agents or the orchestrator should be submitted to HCS (see `submitTopicMessage`).
- Store returned transaction ids (`hcsTxId`) in the transcript for verifiability.

Linking in UI:
- Display topic link via `https://hashscan.io/testnet/topic/{topicId}` (already supported in `components/evaluation-progress.tsx`).
- Provide a collapsible transcript UI with all messages, grouped by rounds and phases.

---

## 5) Orchestrator Output Shape

Recommended return value for `executeEvaluation(request, config)`:

```typescript
export interface OrchestratorOutput {
  requestId: string
  topicId: string
  orchestratorWallet: OrchestratorWallet
  progress: EvaluationProgress
  transcript: EvaluationTranscript
  consensus: ConsensusResult
  individualResults: Array<{
    agentId: string
    score: number
    feedback: string
    strengths: string[]
    improvements: string[]
    completedAt: number
    paymentTx?: string
  }>
  walletOperations: Array<{
    type: 'creation' | 'funding' | 'payment' | 'cleanup'
    txId: string
    amount?: number
    timestamp: number
    description: string
  }>
}
```

This aligns with UI needs:
- Progress display uses `EvaluationProgress` (status, round, variance, topic id)
- Result card uses `ConsensusResult`
- Detail tabs can consume `individualResults` for each judge
- Full chat transcript uses `transcript`
- Wallet operations tracked in `walletOperations` for transparency

---

## 6) Running a Local Judge Test

Use the included script as a starting point to validate types and workflow:

```bash
bun run scripts/test-orchestrator.ts
```

That script demonstrates:
- Orchestrator config validation
- Mock agents
- Judgment request preparation
- Workflow stages and consensus options

To execute an actual evaluation run, the orchestrator should expose:

```typescript
// Pseudocode: lib/hedera/multi-agent-orchestrator
import type { OrchestratorConfig, JudgmentRequest, OrchestratorWallet } from '@/types/agent'

export async function executeEvaluation(
  request: JudgmentRequest,
  config: OrchestratorConfig
): Promise<OrchestratorOutput> {
  // 1) Create or retrieve AA wallet for orchestrator
  // 2) Fund wallet if needed
  // 3) Create HCS topic
  // 4) Independent scoring
  // 5) Discussion rounds
  // 6) Consensus aggregation
  // 7) Process agent payments via AA wallet
  // 8) Publish final result to HCS
  // 9) Return OrchestratorOutput with full transcript and wallet operations
}
```

Environment prerequisites for real runs:
- Hedera testnet credentials (`HEDERA_ACCOUNT_ID`, `HEDERA_PRIVATE_KEY`)
- AI model API keys (OpenAI/Anthropic/Groq/Ollama)
- Sufficient HBAR for HCS messages if not in mock mode
- AA wallet creation and management capabilities

---

## 7) UI Surfacing of Full Transcript

Display the transcript alongside progress and results. Suggested approach:
- Add a new tab in the results view to show the full conversation
- Group by round; within each round, group by phase
- Include tiny badges for roles and a link icon for `hcsTxId` to HashScan

Example rendering structure (simplified):

```tsx
// In a Results page component
function TranscriptView({ transcript }: { transcript: EvaluationTranscript }) {
  return (
    <div>
      <div className="text-sm opacity-70">HCS Topic: {transcript.topicId}</div>
      {transcript.rounds.map(r => (
        <div key={r.round} className="mt-4">
          <div className="font-semibold">Round {r.round}{r.variance !== undefined ? ` • variance ${r.variance.toFixed(3)}` : ''}</div>
          <div className="space-y-2 mt-2">
            {r.messages.map(m => (
              <div key={m.id} className="p-3 border rounded">
                <div className="text-xs opacity-70">
                  {m.phase} • {m.role}{m.agentId ? ` • ${m.agentId}` : ''} • {new Date(m.timestamp).toLocaleTimeString()} {m.hcsTxId ? (
                    <a className="ml-2 text-brand-cyan" href={`https://hashscan.io/testnet/transaction/${m.hcsTxId}`} target="_blank" rel="noreferrer">tx</a>
                  ) : null}
                </div>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

The existing `EvaluationProgressTracker` already supports linking a topic id. Use the above block in a new "Transcript" tab to provide complete transparency.

---

## 8) Hedera Publishing Guidance

Use `lib/hedera/agent-service.ts` to:
- Create topic: `createAgentTopic(topicMemo)`
- Submit message: `submitTopicMessage(topicId, message)`

Recommended message payload:

```json
{
  "type": "jurybox.message",
  "phase": "discussion",
  "round": 2,
  "agentId": "agent-1",
  "content": "I believe the technical depth score should be adjusted based on...",
  "timestamp": 1730051111111
}
```

Store the returned tx id inside `ConversationMessage.hcsTxId`.

---

## 9) Example End-to-End Flow

1) Build `JudgmentRequest` with content, selected agents, and user address
2) Provide `OrchestratorConfig`
3) Backend creates AA wallet for orchestrator (if not provided)
4) Call `executeEvaluation(request, config)`
5) Stream or poll `EvaluationProgress` for UI stages
6) On completion, render `consensus`, `individualResults`, `transcript`, and `walletOperations`
7) Link to HashScan with `topicId` and each `hcsTxId`
8) Display wallet operations and funding transactions for transparency

This ensures: transparent discussions, verifiable auditability on HCS, secure wallet management, and reproducible evaluation results.


