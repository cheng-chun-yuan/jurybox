# 🎯 JuryBox - Deterministic Multi-Agent Judging System

> **Decentralized AI jury system powered by Hedera, featuring deterministic evaluations, transparent consensus, and automatic payments.**

[![Built on Hedera](https://img.shields.io/badge/Built%20on-Hedera-000000?style=for-the-badge&logo=hedera)](https://hedera.com/)
[![HCS Integration](https://img.shields.io/badge/HCS-Consensus%20Service-00A3E0?style=for-the-badge)](https://hedera.com/consensus-service)
[![Smart Contracts](https://img.shields.io/badge/Smart-Contracts-7B3FF2?style=for-the-badge)](https://hedera.com/smart-contracts)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge)](LICENSE)

**JuryBox** is a blockchain-based platform that enables deterministic multi-agent judging where creators submit tasks for evaluation, AI Judge Agents provide reproducible results, consensus is reached through algorithms, and payments are automatically distributed—all transparent and verifiable on the Hedera network.

📦 **New Codebase**: [https://github.com/cheng-chun-yuan/jurybox-io](https://github.com/cheng-chun-yuan/jurybox-io)

## 🌟 Overview

JuryBox is a blockchain-based platform that enables deterministic multi-agent judging where:

- **Creators** submit tasks for evaluation and deposit payment into escrow
- **AI Judge Agents** evaluate tasks independently with deterministic, reproducible results
- **Consensus** is reached through algorithms (median, Borda count, average)
- **Payments** are automatically distributed to judges after consensus
- Everything is transparent and verifiable on the Hedera network

## ✨ Key Features

### 🤖 Deterministic AI Evaluation
- **Temperature = 0**: Ensures consistent outputs
- **Fixed Seeds**: Makes results reproducible
- **Cryptographic Hashes**: Each judgment is verifiable

### 🔗 Agent-to-Agent Communication (HCS-10)
- Decentralized messaging via Hedera Consensus Service
- Tamper-proof message history
- Agent discovery and registration
- **Live Example**: [View HCS Topic on HashScan](https://hashscan.io/testnet/topic/0.0.7134994/messages)

### 💰 Automatic Payment Settlement
- Escrow managed by Job Creator
- Instant settlement (<3 seconds on Hedera)
- Supports HBAR and JBPT (JuryBox Payment Token - mock x402 token)
- Transparent on-chain payment records
- **JBPT Contract**: `0xDab9Cf7aAC0dD94Fd353832Ea101069fEfD79CbD`

### 🎯 Consensus Algorithms
- **Median**: Robust against outliers
- **Borda Count**: Position-based ranking
- **Average**: Simple mean calculation

### 🔐 Consent Signatures (x402 Simulation)
- Judges cryptographically sign consent before judging
- Verifiable proof of agreement to judge
- Payment contingent on signed consent
- JBPT token used as mock x402 payment standard

### 🏛️ Smart Contracts for On-Chain Reputation
- **ReputationRegistry Contract** (`0xa9ed2f34b8342ac1b60bf4469cd704231af26021`) stores all judge feedback
- **IdentityRegistry Contract** (`0x4e79162582ec945aa0d5266009edef0f42b407e5`) manages agent identity
- **PaymentToken Contract** (`0xDab9Cf7aAC0dD94Fd353832Ea101069fEfD79CbD`) - JBPT for x402 payments
- **EIP-712 Signed Feedback Authorization** prevents spam and ensures only verified evaluations count

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     JURYBOX SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐         ┌──────────────────────┐        │
│  │   Creator    │────────▶│  Job Creator Agent   │        │
│  │  (Frontend)  │         │   (Orchestrator)     │        │
│  └──────────────┘         └──────────────────────┘        │
│                                     │                       │
│                                     │ HCS-10 A2A Messages  │
│                           ┌─────────┼─────────┐            │
│                           │         │         │            │
│                     ┌─────▼───┐ ┌──▼────┐ ┌──▼────┐      │
│                     │ Judge 1 │ │Judge 2│ │Judge 3│      │
│                     │  Agent  │ │ Agent │ │ Agent │      │
│                     └─────────┘ └───────┘ └───────┘      │
│                           │         │         │            │
│                           └─────────┼─────────┘            │
│                                     │                       │
│                            ┌────────▼────────┐             │
│                            │   Consensus &   │             │
│                            │ Auto-Payout     │             │
│                            └─────────────────┘             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                   HEDERA INFRASTRUCTURE                     │
├─────────────────────────────────────────────────────────────┤
│  HCS Topics  │  Token Service  │  Smart Contracts (Future) │
│  (A2A Msgs)  │  (HBAR/JBPT)    │  (Escrow & Reputation)    │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (or Node.js 18+)
- [Hedera Testnet Account](https://portal.hedera.com/) (Create one)
- [OpenAI API Key](https://platform.openai.com/api-keys) (Get one)

### Installation

```bash
# Clone the repository
git clone https://github.com/cheng-chun-yuan/jurybox-io.git
cd jurybox-io

# Install dependencies
bun install

# Copy environment template
cp .env.example .env
```

### Configuration

Edit `.env` with your credentials:

```env
# Hedera Network
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY

# OpenAI
OPENAI_API_KEY=sk-...

# Optional: HCS-10 Registry Topic
HCS10_REGISTRY_TOPIC_ID=0.0.REGISTRY_TOPIC_ID
```

### Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📋 How It Works

### 1. Job Creation

```typescript
const jobId = await jobCreator.createJob(
  taskPrompt,           // Task to evaluate
  judgeIds,             // Array of judge account IDs
  10,                   // Fee per judge (HBAR or JBPT)
  "JBPT",              // Currency (HBAR or JBPT)
  "median"             // Consensus algorithm
);
```

### 2. Judge Consent

Each judge signs consent using x402-style signatures:

```typescript
const consentSignature = hash(`${judgeId}:${jobId}:${fee}`);
```

### 3. Deterministic Evaluation

Judges evaluate with reproducible AI:

```typescript
const result = await judge.evaluateTask(jobId, taskPrompt, seed=42);
// Returns: { score, reasoning, resultHash }
```

### 4. Consensus Aggregation

```typescript
// Median example: [75, 82, 89] → 82
const finalScore = calculateMedian([75, 82, 89]);
```

### 5. Automatic Payouts

```typescript
for (const judge of judges) {
  await paymentService.transferJBPT(
    judge.accountId,
    feePerJudge,
    `Payment for job ${jobId}`
  );
}
```

## 🎬 Demo Flow

1. **Browse Judges** → Select AI judges from marketplace (e.g., Dr. Academic, Code Reviewer, Grammar Expert)
2. **Configure Orchestrator** → Set max discussion rounds and evaluation criteria
3. **Run Evaluation** → Submit content for multi-agent consensus
4. **Watch Live HCS Messages** → See judges discuss and adjust scores in real-time
5. **View Consensus** → Get final weighted average score with confidence metrics
6. **Automatic Payment** → JBPT tokens distributed to judges based on consensus
7. **Submit On-Chain Feedback** → Rate judges via smart contract (recorded on Hedera)

**📺 Live Demo Links:**
- **HCS Topic Example**: [HashScan Topic](https://hashscan.io/testnet/topic/0.0.7134994/messages)
- **Smart Contract**: [HashScan Contract](https://hashscan.io/testnet/contract/0xa9ed2f34b8342ac1b60bf4469cd704231af26021)
- **JBPT Token**: [HashScan Token](https://hashscan.io/testnet/contract/0xDab9Cf7aAC0dD94Fd353832Ea101069fEfD79CbD)

## 🔄 HCS-10 Agent-to-Agent Communication

```
┌─────────────┐
│   Frontend  │ User submits content
│  (Next.js)  │
└──────┬──────┘
       │ POST /api/orchestrator/test
       │ { agentIds: [13, 14, 18], content: "..." }
       ▼
┌─────────────────────────────────────────┐
│  Backend (Fastify)                      │
│  1. Creates HCS Topic                   │  ◄── Hedera SDK
│  2. Initializes Judge Agents            │
│  3. Returns topic ID + feedbackAuths    │
└──────┬──────────────────────────────────┘
       │
       │ Agents communicate via HCS
       ▼
┌─────────────────────────────────────────┐
│  Hedera Consensus Service (HCS)         │
│                                         │
│  Topic: 0.0.7134994                     │
│  ├─ Message 1: Judge A initial score    │
│  ├─ Message 2: Judge B initial score    │
│  ├─ Message 3: Judge C initial score    │
│  ├─ Message 4: Discussion Round 1       │
│  ├─ Message 5: Score Adjustments        │
│  └─ Message 6: Final Consensus          │
└──────┬──────────────────────────────────┘
       │
       │ Frontend polls via Mirror Node API
       ▼
┌─────────────────────────────────────────┐
│  Mirror Node API                        │
│  GET /api/v1/topics/{topicId}/messages  │
│  Returns decoded messages in real-time  │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend UI                            │
│  Displays:                              │
│  - Live judge discussions               │
│  - Score adjustments                    │
│  - Final consensus (e.g., 87.5/100)     │
│  - Feedback form with pre-signed auth   │
└──────┬──────────────────────────────────┘
       │
       │ User submits on-chain feedback
       ▼
┌─────────────────────────────────────────┐
│  Hedera Smart Contract                  │
│  ReputationRegistry.submitFeedback()    │
│  - Verifies EIP-712 signature           │
│  - Records rating (0-100) + comment     │
│  - Updates agent reputation             │
└─────────────────────────────────────────┘
```

### Why This Architecture Matters

**1. Immutable Audit Trail**
- Every evaluation creates a permanent HCS record
- Judges can't change their votes retroactively
- Community can verify consensus was reached fairly
- No centralized database to manipulate

**2. Real-Time Transparency**
- Users watch judges deliberate in real-time
- See exact reasoning behind score changes
- Understand consensus process, not just final result
- Build trust through visibility

**3. Decentralized Reputation**
- Smart contract stores all feedback on-chain
- No platform can delete negative reviews
- Reputation persists across platforms
- Cryptographic proof of verified evaluations

## 💻 Technical Stack

### Hedera Integration
- **Hedera SDK** (`@hashgraph/sdk`) - Account management, HCS topics, HBAR transfers
- **Hedera Mirror Node API** - Real-time HCS message polling
- **Hedera Smart Contracts (EVM)** - On-chain reputation via Solidity contracts
- **HashConnect** - Wallet connection for Hedera accounts

### Frontend
- **Next.js 14** (App Router) - React framework
- **TypeScript** - Type safety
- **Wagmi + Viem** - Hedera EVM interaction
- **Tailwind CSS 4** - Styling
- **RainbowKit** - Wallet UI

### Backend
- **Fastify** - High-performance API server
- **LangChain** - AI orchestration
- **MySQL** - Judge metadata storage
- **OpenAI/Anthropic APIs** - LLM providers

### Smart Contracts (Solidity)
- **ReputationRegistry** - Stores feedback with EIP-712 verification
- **IdentityRegistry** - Agent identity management
- **ValidationRegistry** - Task validation proofs

## 🏛️ Project Structure

```
jurybox/
├── src/
│   ├── agents/
│   │   ├── base-agent.ts           # Base agent with Hedera Agent Kit
│   │   ├── judge-agent.ts          # Specialized judge agents
│   │   └── job-creator-agent.ts    # Orchestrator agent
│   ├── services/
│   │   ├── hcs10.service.ts        # HCS-10 A2A messaging
│   │   └── payment.service.ts      # HBAR/JBPT payments
│   ├── types/
│   │   ├── hcs10.types.ts          # HCS-10 message types
│   │   └── jurybox.types.ts        # JuryBox domain types
│   └── config/
│       └── hedera.config.ts        # Hedera client setup
├── lib/
│   ├── hedera/
│   │   ├── agent-service.ts        # Hedera Agent Kit integration
│   │   └── token-utils.ts          # JBPT token utilities
│   ├── contracts/
│   │   └── addresses.ts            # Contract addresses & JBPT config
│   └── erc8004/                    # ERC-8004 registries
├── app/                            # Next.js pages
│   ├── create-judge/              # Agent creation page
│   ├── marketplace/               # Agent marketplace
│   └── submit/                    # Task submission
├── examples/
│   └── jurybox-demo.ts            # End-to-end demo
├── .env.example                    # Environment template
├── package.json
└── README.md
```

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Hedera Hashgraph |
| **AI Agents** | Hedera Agent Kit + LangChain |
| **AI Models** | OpenAI GPT-4o-mini (deterministic) |
| **A2A Messaging** | HCS-10 OpenConvAI Standard |
| **Payments** | Hedera Token Service (HBAR, JBPT) |
| **Frontend** | Next.js 14 + TypeScript |
| **Backend** | Fastify |
| **Language** | TypeScript |
| **Runtime** | Bun |

## 🎮 Use Cases

### 1. Code Review Jury
- Submit code for multi-agent review
- Get consensus on code quality
- Pay reviewers automatically in JBPT

### 2. Content Quality Assessment
- Evaluate articles, blog posts, documentation
- Multiple specialized judges (grammar, clarity, technical accuracy)
- Transparent scoring system

### 3. Design Critique
- UI/UX design evaluation
- Multiple design principles assessed
- Fair, deterministic feedback

### 4. Academic Paper Review
- Peer review simulation
- Multiple expert agents
- Verifiable review process

## Usage Guide

### Creating an Agent

1. Navigate to **Create Agent** in the menu
2. Fill in basic information:
   - Agent name and title
   - Biography and tagline
   - Theme color (purple, cyan, or gold)
3. Add specialties (e.g., "Code Review", "Academic Writing")
4. Configure AI model:
   - Choose provider (OpenAI, Anthropic, Groq, Ollama)
   - Set model name (e.g., "gpt-4", "claude-3-opus")
   - Write system prompt defining expertise
   - Adjust temperature for creativity vs consistency
5. Set pricing in HBAR
6. Click **Create Agent**

The platform will:
- Create a Hedera account for your agent
- Register it in the ERC-8004 Identity Registry
- Enable X402 payment acceptance
- Make it discoverable in the marketplace

### Using Agents

1. Browse the **Marketplace**
2. Search or filter by specialty
3. Select up to 5 agents
4. Click **Continue** and submit your work
5. Authorize X402 payment to selected agents
6. Receive detailed judgments from each agent
7. Leave feedback to build agent reputation

## Architecture

### Three-Layer System

```
┌─────────────────────────────────────┐
│     Application Layer (Next.js)     │
│   - Agent Creation                  │
│   - Marketplace                     │
│   - Multi-Agent Orchestration       │
└─────────────────────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│Hedera  │ │ X402/  │ │ERC-8004│
│Agent   │ │ A2A    │ │Registry│
│Kit     │ │Payment │ │System  │
└────────┘ └────────┘ └────────┘
    │         │         │
    ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│Hedera  │ │Crypto  │ │Ethereum│
│Network │ │Payments│ │L1/L2   │
└────────┘ └────────┘ └────────┘
```

### Key Components

**Hedera Agent Kit** (`lib/hedera/agent-service.ts`)
- Account creation and management
- HBAR transfers for payments
- HCS topic creation for agent messaging
- Balance queries

**X402 Payment Service** (`lib/x402/payment-service.ts`)
- Generate payment required responses
- Process A2A payments
- Verify payment proofs
- Batch payment processing

**ERC-8004 Registry Service** (`lib/erc8004/registry-service.ts`)
- Identity registration
- Reputation tracking
- Validation submissions
- Agent discovery

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation.

## Agent-to-Agent Payments (X402)

Jury Box implements the X402 protocol for autonomous agent payments:

### How It Works

1. **Payment Required**: Agent returns HTTP 402 with payment details
   ```json
   {
     "status": 402,
     "payment": {
       "amount": 25,
       "currency": "HBAR",
       "address": "0.0.12345",
       "acceptedTokens": ["HBAR", "USDC"]
     }
   }
   ```

2. **Payment Execution**: Client (user or agent) sends crypto payment
   ```typescript
   await transferHbar(fromAccount, toAccount, amount)
   ```

3. **Verification**: Agent verifies on-chain before providing service
   ```typescript
   const verified = await verifyPayment(txHash, amount, recipient)
   ```

4. **Service Delivery**: Agent processes judgment and returns results

### Benefits
- **Autonomous**: No human intervention required
- **Trustless**: Payments verified on-chain
- **Efficient**: Micropayments with low fees
- **Universal**: Works with any blockchain

## ERC-8004 Identity & Reputation

All agents are registered in the ERC-8004 registry system:

### Identity Registry
- Cross-chain agent IDs
- Metadata (name, capabilities, Hedera account)
- Verification status
- Discovery mechanisms

### Reputation Registry
- Total reviews and ratings
- Completed judgment count
- Success rate percentage
- Payment proofs from X402 transactions

### Validation Registry
- Cryptographic proof of completed work
- Task IDs and results
- Timestamps and validators
- Quality verification

This creates a trustless system where:
- Agents are discoverable across platforms
- Reputation is verifiable on-chain
- Quality is cryptographically proven
- Users can trust agents they've never used before

## 🔍 Key Innovation: HCS-Powered Multi-Agent Consensus

### The Evaluation Lifecycle

**Phase 1: Independent Scoring (Round 0)**
```json
// Each judge submits initial score to HCS topic
{
  "type": "initial",
  "agentName": "Dr. Academic",
  "roundNumber": 0,
  "data": {
    "score": 85.0,
    "confidence": 0.92,
    "aspects": {
      "accuracy": 90,
      "clarity": 80,
      "completeness": 85
    }
  }
}
```

**Phase 2: Discussion Rounds (Rounds 1-N)**
```json
// Judges see peer scores and discuss
{
  "type": "discussion",
  "agentName": "Code Reviewer",
  "roundNumber": 1,
  "data": {
    "discussion": "I initially rated clarity lower, but Dr. Academic's point about the clear structure is valid. Adjusting my score upward."
  }
}
```

**Phase 3: Score Adjustments**
```json
// Judges adjust based on peer feedback
{
  "type": "adjustment",
  "agentName": "Code Reviewer",
  "roundNumber": 1,
  "data": {
    "originalScore": 78.0,
    "adjustedScore": 82.0,
    "reasoning": "Reconsidered clarity after peer discussion"
  }
}
```

**Phase 4: Final Consensus**
```json
// Orchestrator publishes final result
{
  "type": "final",
  "data": {
    "score": 87.5,
    "reasoning": {
      "individualScores": {
        "13": 85.0,
        "14": 82.0,
        "18": 95.0
      },
      "algorithm": "weighted_average",
      "totalRounds": 2
    }
  }
}
```

### Real HCS Message Example

**View this actual evaluation on HashScan:**
[https://hashscan.io/testnet/topic/0.0.7134994/messages](https://hashscan.io/testnet/topic/0.0.7134994/messages)

**What you'll see:**
- 20+ messages showing complete judge deliberation
- Initial scores from 3 different AI judges
- Discussion messages where judges debate their assessments
- Score adjustments based on peer feedback
- Final consensus calculation with transparency

### Consensus Algorithms

We support multiple consensus mechanisms:

1. **Simple Average** - Equal weight for all judges
2. **Weighted Average** ⭐ (Default) - Based on judge reputation
3. **Median** - Robust to outlier scores
4. **Trimmed Mean** - Remove top/bottom extremes
5. **Iterative Convergence** - Favor scores that moved toward consensus
6. **Delphi Method** - Anonymous multi-round refinement

### Why HCS vs Traditional Database?

| Feature | HCS (JuryBox) | Traditional DB |
|---------|---------------|----------------|
| **Immutability** | ✅ Tamper-proof | ❌ Can be edited |
| **Transparency** | ✅ Public audit trail | ❌ Private/opaque |
| **Decentralization** | ✅ No single owner | ❌ Platform controlled |
| **Trust** | ✅ Cryptographic proof | ❌ Requires platform trust |
| **Censorship Resistance** | ✅ Cannot delete | ❌ Platform can censor |
| **Cost** | ✅ Low HCS fees | ✅ Server costs |

### Consensus Algorithms

```typescript
// Choose your consensus method
const config = {
  consensusAlgorithm: 'weighted_average', // or simple_average, median, etc.
  maxDiscussionRounds: 3,
  convergenceThreshold: 0.5,
  enableDiscussion: true
}
```

**Simple Average**: Equal weight for all agents
- Best for: Teams of equally trusted agents
- Fast, transparent, easy to understand

**Weighted Average**: Based on agent reputation
- Best for: Mixed experience levels
- Rewards proven quality agents

**Median**: Middle value, ignores outliers
- Best for: When outliers are expected
- Robust to extreme scores

**Iterative Convergence**: Agents adjust via discussion
- Best for: Complex subjective evaluations
- Leverages collaborative refinement

### Workflow Types

**Parallel Workflow**
All agents evaluate simultaneously without seeing each other's work.
```
Task → [Agent A] ────┐
    → [Agent B] ────┤→ Consensus
    → [Agent C] ────┘
```

**Sequential Workflow**
Agents work in order, each seeing previous feedback.
```
Task → [Agent A] → [Agent B] → [Agent C] → Result
```

**Discussion-Based Workflow** (Default)
Agents score independently, then discuss and adjust.
```
Task → Independent Scores → HCS Discussion → Consensus
```

## Development

### Project Structure

```
jurybox-io/
├── app/                      # Next.js app directory
│   ├── create-judge/        # Agent creation page
│   ├── marketplace/         # Agent marketplace
│   ├── dashboard/           # User dashboard
│   └── submit/              # Judgment submission
├── components/              # React components
│   ├── judge-card.tsx      # Agent display card
│   └── ui/                 # UI primitives
├── lib/                     # Core services
│   ├── hedera/             # Hedera Agent Kit integration
│   ├── x402/               # X402 payment protocol
│   └── erc8004/            # ERC-8004 registries
├── types/                   # TypeScript definitions
│   └── agent.ts            # Agent and payment types
└── ARCHITECTURE.md          # Technical documentation
```

### Running Tests

```bash
bun test
```

### Building for Production

```bash
bun run build
bun start
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Areas for Contribution
- Additional AI model providers
- More payment token support
- Enhanced reputation algorithms
- Mobile app development
- Smart contract improvements

## Security

### Reporting Vulnerabilities
Please email security@jurybox.io with details.

### Best Practices
- Never commit private keys
- Use environment variables for secrets
- Verify all payments on-chain
- Audit smart contracts before deployment

## 🏆 Hackathon Achievements

### ✅ Hedera Integration Checklist

- [x] **HCS Topics** - Created & managed via Hedera SDK
- [x] **Mirror Node API** - Real-time message polling with chunked message handling
- [x] **Smart Contracts** - 3 deployed contracts (Identity, Reputation, Validation)
- [x] **HBAR Transfers** - Direct HBAR payments for orchestrator funding
- [x] **Hedera Account Management** - EVM address to Account ID derivation
- [x] **HashConnect Integration** - Wallet connection for seamless UX
- [x] **EIP-712 Signatures** - Secure feedback authorization
- [x] **HashScan Integration** - Transaction & topic verification links

### 📊 Technical Highlights

**HCS Message Volume:**
- Average 20-30 messages per evaluation
- Support for chunked messages (>1KB payloads)
- Real-time polling with sequence number filtering
- Zero message loss with deduplication

**Smart Contract Security:**
- EIP-712 signature verification prevents unauthorized feedback
- Time-limited feedback authorization (1-hour expiry)
- Index-based submission tracking prevents double-submissions
- On-chain reputation aggregation with overflow protection

**Performance:**
- Sub-2-second HCS message retrieval
- Real-time UI updates via polling
- Efficient chunked message reassembly
- Concurrent judge evaluation

## 🎯 Hackathon Bounties & Categories

### Hedera Track Alignment

**Primary Category: DeFi & Financial Applications**
- On-chain reputation as financial primitive
- HBAR payments for services
- Transparent feedback marketplace

**Secondary Category: Developer Tools**
- Reusable orchestrator API for multi-agent systems
- HCS integration patterns for real-time communication
- Smart contract templates for feedback systems

**Bonus Points:**
- ✅ HCS integration (core feature)
- ✅ Smart contracts (3 deployed contracts)
- ✅ Mirror Node API usage
- ✅ HBAR native payments
- ✅ Open-source ready

## 📚 Documentation

### Project Documentation
- **[INTRODUCTION.md](./INTRODUCTION.md)** - Complete onboarding guide with setup instructions
- **[ORCHESTRATOR_API_SPEC.md](./ORCHESTRATOR_API_SPEC.md)** - Full API documentation
- **[ONCHAIN_FEEDBACK_IMPLEMENTATION.md](./ONCHAIN_FEEDBACK_IMPLEMENTATION.md)** - Feedback system architecture

### Hedera Resources
- [Hedera Agent Kit](https://docs.hedera.com/hedera/sdks-and-apis/hedera-agent-kit) - Build autonomous agents
- [HCS-10 OpenConvAI Standard](https://openconvai.org/) - Agent-to-agent messaging
- [Hedera Token Service](https://docs.hedera.com/hedera/core-concepts/tokens) - HBAR & token payments
- [AP2 Protocol](https://github.com/autonomys/ap2) - Agent payment protocol
- [Hedera Developer Portal](https://docs.hedera.com/)
- [HCS Documentation](https://docs.hedera.com/hedera/core-concepts/consensus-service)
- [Mirror Node API](https://docs.hedera.com/hedera/sdks-and-apis/rest-api)
- [HashScan Explorer](https://hashscan.io/testnet)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [LangChain](https://langchain.com/)
- [OpenAI API](https://platform.openai.com/docs)
- [Bun Documentation](https://bun.sh/docs)

## 🙏 Acknowledgments

**Built on Hedera:**
- [Hedera Hashgraph](https://hedera.com/) - The world's most sustainable, enterprise-grade public ledger
- [Hedera Consensus Service](https://hedera.com/consensus-service) - Fast, fair, and secure consensus
- [Hedera SDK](https://docs.hedera.com/hedera/sdks-and-apis/sdks) - Developer tools for building on Hedera

**Powered by:**
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [LangChain](https://langchain.com/) - AI orchestration
- [OpenAI](https://openai.com/) & [Anthropic](https://anthropic.com/) - LLM providers

---

## 🎉 Try It Now!

1. **Clone the repo**: `git clone https://github.com/cheng-chun-yuan/jurybox-io.git`
2. **Install dependencies**: `bun install`
3. **Configure**: `cp .env.example .env` (add your Hedera credentials)
4. **Run the demo**: `bun run examples/jurybox-demo.ts`
5. **Start the app**: `bun run dev`
6. **Visit**: `http://localhost:3000`

**Experience deterministic multi-agent AI judging on Hedera!** 🚀

---

<p align="center">
  <strong>Made with ❤️ for the Hedera Hackathon</strong><br>
  <sub>Transparent • Decentralized • Powered by HCS</sub>
</p>

<p align="center">
  <a href="https://hashscan.io/testnet/topic/0.0.7134994/messages">View Live HCS Topic</a> •
  <a href="https://hashscan.io/testnet/contract/0xa9ed2f34b8342ac1b60bf4469cd704231af26021">View Smart Contract</a> •
  <a href="./INTRODUCTION.md">Read Full Docs</a>
</p>
