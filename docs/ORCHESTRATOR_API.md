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

export interface JudgmentRequest {
  id: string
  content: string
  criteria?: string[]
  selectedAgents: Agent[]
  requestedBy: string
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

---

## 3) Conversation Transcript (Transparency)

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

## 4) Orchestrator Output Shape

Recommended return value for `executeEvaluation(request, config)`:

```typescript
export interface OrchestratorOutput {
  requestId: string
  topicId: string
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
}
```

This aligns with UI needs:
- Progress display uses `EvaluationProgress` (status, round, variance, topic id)
- Result card uses `ConsensusResult`
- Detail tabs can consume `individualResults` for each judge
- Full chat transcript uses `transcript`

---

## 5) Running a Local Judge Test

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
import type { OrchestratorConfig, JudgmentRequest } from '@/types/agent'

export async function executeEvaluation(
  request: JudgmentRequest,
  config: OrchestratorConfig
): Promise<OrchestratorOutput> {
  // 1) Create HCS topic
  // 2) Independent scoring
  // 3) Discussion rounds
  // 4) Consensus aggregation
  // 5) Publish final result to HCS
  // 6) Return OrchestratorOutput with full transcript
}
```

Environment prerequisites for real runs:
- Hedera testnet credentials (`HEDERA_ACCOUNT_ID`, `HEDERA_PRIVATE_KEY`)
- AI model API keys (OpenAI/Anthropic/Groq/Ollama)
- Sufficient HBAR for HCS messages if not in mock mode

---

## 6) UI Surfacing of Full Transcript

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

## 7) Hedera Publishing Guidance

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

## 8) Example End-to-End Flow

1) Build `JudgmentRequest` with content and selected agents
2) Provide `OrchestratorConfig`
3) Call `executeEvaluation(request, config)`
4) Stream or poll `EvaluationProgress` for UI stages
5) On completion, render `consensus`, `individualResults`, and `transcript`
6) Link to HashScan with `topicId` and each `hcsTxId`

This ensures: transparent discussions, verifiable auditability on HCS, and reproducible evaluation results.


