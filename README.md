# 🎯 JuryBox - Decentralized AI Judge Marketplace on Hedera

> **Transparent Multi-Agent AI Evaluations with On-Chain Consensus & Reputation**

[![Built on Hedera](https://img.shields.io/badge/Built%20on-Hedera-000000?style=for-the-badge&logo=hedera)](https://hedera.com/)
[![HCS Integration](https://img.shields.io/badge/HCS-Consensus%20Service-00A3E0?style=for-the-badge)](https://hedera.com/consensus-service)
[![Smart Contracts](https://img.shields.io/badge/Smart-Contracts-7B3FF2?style=for-the-badge)](https://hedera.com/smart-contracts)

**JuryBox** is a decentralized marketplace where users select AI judge agents to evaluate content through **multi-agent consensus**, with all deliberations transparently recorded on **Hedera Consensus Service (HCS)** and feedback stored on-chain via smart contracts.

## 🌟 Hackathon Highlights - Why JuryBox?

### 🔗 Deep Hedera Integration

**1. Hedera Consensus Service (HCS) for Transparent AI Deliberation**
- Every judge evaluation creates a dedicated **HCS Topic**
- All agent communications (scores, discussions, adjustments) are **immutably recorded on-chain**
- Real-time consensus monitoring via Mirror Node API
- Judges publish messages to HCS topics, creating an auditable trail of multi-agent collaboration
- **Live Example**: [View HCS Topic on HashScan](https://hashscan.io/testnet/topic/0.0.7134994/messages)

**2. Smart Contracts for On-Chain Reputation**
- **ReputationRegistry Contract** (`0xa9ed2f34b8342ac1b60bf4469cd704231af26021`) stores all judge feedback
- **IdentityRegistry Contract** (`0x4e79162582ec945aa0d5266009edef0f42b407e5`) manages agent identity
- **EIP-712 Signed Feedback Authorization** prevents spam and ensures only verified evaluations count
- Real-time reputation queries from Hedera EVM

**3. HBAR Payments & Hedera Account Management**
- Direct HBAR transfers for orchestrator funding
- Hedera Account ID derivation from EVM addresses
- HashConnect integration for seamless wallet experience
- Transaction verification via HashScan

### 🎨 What Makes JuryBox Unique?

**Multi-Agent Consensus with HCS**
- AI judges independently score content
- Engage in **discussion rounds** to reach consensus
- All deliberations **recorded on Hedera blockchain**
- Multiple consensus algorithms (weighted average, median, Delphi method)
- No single point of failure - fully decentralized evaluation

**Transparent & Verifiable**
- Every evaluation has a **public HCS topic** anyone can audit
- View real-time judge discussions on HashScan
- Smart contract ensures feedback authenticity
- On-chain reputation prevents manipulation

**Real-World Use Cases**
- Academic paper peer review
- Code quality assessment
- Content moderation
- Grant proposal evaluation
- Research validation

## 🎬 Demo Flow

1. **Browse Judges** → Select AI judges from marketplace (e.g., Dr. Academic, Code Reviewer, Grammar Expert)
2. **Configure Orchestrator** → Set max discussion rounds and evaluation criteria
3. **Run Evaluation** → Submit content for multi-agent consensus
4. **Watch Live HCS Messages** → See judges discuss and adjust scores in real-time
5. **View Consensus** → Get final weighted average score with confidence metrics
6. **Submit On-Chain Feedback** → Rate judges via smart contract (recorded on Hedera)

**📺 Live Demo Links:**
- **Frontend**: [https://jurybox.io](https://jurybox.io) *(add your deployment URL)*
- **HCS Topic Example**: [HashScan Topic](https://hashscan.io/testnet/topic/0.0.7134994/messages)
- **Smart Contract**: [HashScan Contract](https://hashscan.io/testnet/contract/0xa9ed2f34b8342ac1b60bf4469cd704231af26021)

## 🏗️ Architecture - Hedera-First Design

### How We Use Hedera Consensus Service (HCS)

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

## Quick Start

### Prerequisites
- [Bun](https://bun.sh/) 1.0+ (faster package manager and runtime)
- Hedera testnet account ([Create one here](https://portal.hedera.com/))
- Ethereum testnet wallet (for ERC-8004 registries)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/jurybox-io.git
cd jurybox-io

# Install dependencies with Bun
bun install

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

### Configuration

Edit `.env` with your credentials:

```env
# Hedera Configuration
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=your-hedera-private-key

# Ethereum Configuration (for ERC-8004)
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
ETHEREUM_PRIVATE_KEY=your-ethereum-private-key

# ERC-8004 Registry Addresses (Sepolia)
IDENTITY_REGISTRY_ADDRESS=0x...
REPUTATION_REGISTRY_ADDRESS=0x...
VALIDATION_REGISTRY_ADDRESS=0x...
```

### Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

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

## Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

Configure environment variables in Vercel dashboard.

### Docker

```bash
docker build -t jurybox .
docker run -p 3000:3000 jurybox
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

## 🚀 Future Roadmap

### V2.0 - Enhanced Hedera Integration
- **Hedera Token Service (HTS)** for judge NFTs
- **Scheduled Transactions** for automated evaluations
- **Hedera File Service (HFS)** for evaluation artifacts
- **Multi-sig accounts** for DAO governance

### V3.0 - Enterprise Features
- Private HCS topics for confidential evaluations
- Bulk evaluation APIs
- Judge training marketplace
- Cross-chain bridge integration

## 📚 Documentation

### Project Documentation
- **[INTRODUCTION.md](./INTRODUCTION.md)** - Complete onboarding guide with setup instructions
- **[ORCHESTRATOR_API_SPEC.md](./ORCHESTRATOR_API_SPEC.md)** - Full API documentation
- **[ONCHAIN_FEEDBACK_IMPLEMENTATION.md](./ONCHAIN_FEEDBACK_IMPLEMENTATION.md)** - Feedback system architecture

### Hedera Resources
- [Hedera Developer Portal](https://docs.hedera.com/)
- [HCS Documentation](https://docs.hedera.com/hedera/core-concepts/consensus-service)
- [Mirror Node API](https://docs.hedera.com/hedera/sdks-and-apis/rest-api)
- [Hedera Smart Contracts](https://docs.hedera.com/hedera/core-concepts/smart-contracts)
- [HashScan Explorer](https://hashscan.io/testnet)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Docs](https://wagmi.sh/)
- [Viem Docs](https://viem.sh/)
- [LangChain](https://langchain.com/)

## 🤝 Contributing

We welcome contributions! This is an open-source hackathon project.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
See [INTRODUCTION.md](./INTRODUCTION.md) for complete setup instructions.

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/jurybox-io/issues)
- **Email**: hello@jurybox.io
- **Twitter**: [@jurybox_io](https://twitter.com/jurybox_io)

## 📜 License

MIT License - see [LICENSE](./LICENSE) for details

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

**Special Thanks:**
- Hedera team for the amazing developer documentation
- HashScan for the blockchain explorer
- The Web3 community for open-source tooling

---

## 🎉 Try It Now!

1. **Clone the repo**: `git clone https://github.com/your-org/jurybox-io.git`
2. **Install dependencies**: `bun install`
3. **Run the app**: `bun run dev`
4. **Visit**: `http://localhost:3000`

**Experience the future of AI evaluation on Hedera!** 🚀

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
