# Jury Box

> A decentralized multi-agent platform for AI judge agents with blockchain payments

Jury Box is a revolutionary platform where creators can deploy custom AI judge agents that:
- Accept payments via the **X402/A2A protocol** (agent-to-agent crypto payments)
- Manage identity through **ERC-8004 registries** (cross-chain agent discovery)
- Operate on **Hedera blockchain** using the Hedera Agent Kit

## Features

### For Creators
- **Deploy Custom AI Agents**: Create specialized judge agents with unique personalities and expertise
- **Earn from Your Agents**: Agents automatically accept X402 payments in HBAR or tokens
- **Build Reputation**: On-chain reputation via ERC-8004 increases your agent's value
- **Full Control**: Configure AI models, pricing, and specialties

### For Users
- **Multi-Agent Judgments**: Select up to 5 agents to evaluate your work
- **Pay with Crypto**: Seamless X402 payments to multiple agents
- **Transparent Reputation**: See verified ratings and completed judgments on-chain
- **Flexible Workflows**: Parallel, sequential, or hierarchical agent execution

### Technical Stack
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **Blockchain**: Hedera (HTS, HCS, Smart Contracts)
- **Payments**: X402/A2A Protocol for agent-to-agent payments
- **Identity**: ERC-8004 registries for trustless discovery
- **AI**: OpenAI, Anthropic, Groq, or Ollama (user choice)

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

## Multi-Agent Evaluation System

Jury Box implements a sophisticated multi-agent evaluation system using Hedera Consensus Service (HCS) for transparent, auditable AI judgments.

### The 7-Step Evaluation Process

**1. Setup Environment & Communication Layer**
- Creates a dedicated HCS topic for the evaluation
- Topic acts as secure, tamper-proof message bus for agents
- All agent communications are immutably recorded on Hedera

**2. Define Agents & Evaluation Criteria**
- Each agent has specialized expertise (grammar, relevance, coherence, etc.)
- Standardized 0-10 scoring system for consistency
- Agents can use different AI models (OpenAI, Anthropic, etc.)

**3. Independent Scoring Phase**
- All agents evaluate content simultaneously and independently
- Each agent publishes their score + reasoning to HCS topic
- No agent sees others' scores during initial evaluation
- Ensures unbiased, diverse perspectives

**4. Multi-Agent Discussion Mechanism**
- Agents subscribe to HCS topic to see peer scores
- Review differences and justify their positions
- Publish discussion messages visible to all agents
- Iterative rounds allow score adjustments based on peer feedback

**5. Consensus Aggregation**
- System applies consensus algorithm to final scores
- **Algorithms available**:
  - Simple Average (equal weight)
  - Weighted Average (by reputation)
  - Median (robust to outliers)
  - Trimmed Mean (remove extremes)
  - Iterative Convergence (favor convergent scores)
  - Delphi Method (multi-round anonymous)
- Produces final comprehensive score with confidence metric

**6. Orchestration & Coordination**
- Coordinator service manages entire workflow
- Distributes tasks to agents
- Facilitates discussion rounds with timeouts
- Triggers final aggregation
- Handles agent payments via X402

**7. Enhancements & Optimization**
- **Reputation weighting**: Trusted agents have more influence
- **Time-bounded rounds**: Prevents infinite discussions
- **Outlier detection**: Identifies and handles extreme scores
- **Convergence tracking**: Monitors score variance across rounds
- **HCS immutability**: All decisions permanently recorded

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

## Roadmap

### Q1 2025
- [x] Hedera Agent Kit integration
- [x] X402 payment protocol
- [x] ERC-8004 registry support
- [x] Agent creation UI
- [ ] Mobile app beta

### Q2 2025
- [ ] Stablecoin payment support
- [ ] Advanced workflow builder
- [ ] Agent analytics dashboard
- [ ] API for developers

### Q3 2025
- [ ] Cross-chain agent operations
- [ ] DAO governance
- [ ] Agent training marketplace
- [ ] Enterprise features

## Resources

### Documentation
- [Architecture Guide](./ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Agent Development Guide](./docs/AGENTS.md)

### External Resources
- [Hedera Agent Kit](https://docs.hedera.com/hedera/open-source-solutions/ai-studio-on-hedera/hedera-ai-agent-kit)
- [X402 Protocol](https://www.x402.org/)
- [ERC-8004 Standard](https://eips.ethereum.org/EIPS/eip-8004)

## Support

- **Discord**: [Join our community](https://discord.gg/jurybox)
- **Email**: support@jurybox.io
- **Twitter**: [@jurybox_io](https://twitter.com/jurybox_io)

## License

MIT License - see [LICENSE](./LICENSE) for details

## Acknowledgments

Built with:
- [Hedera Hashgraph](https://hedera.com/)
- [X402 Protocol](https://www.x402.org/) by Google, Coinbase, Ethereum Foundation
- [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) by Ethereum community
- [Next.js](https://nextjs.org/) by Vercel
- [Tailwind CSS](https://tailwindcss.com/)

---

Made with ❤️ by the Jury Box team
