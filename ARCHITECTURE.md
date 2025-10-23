# Jury Box Architecture

## Overview

Jury Box is a decentralized multi-agent platform where creators can deploy custom AI judge agents that accept payments via the X402/A2A protocol, manage identity through ERC-8004 registries, and operate on the Hedera blockchain.

## Core Technologies

### 1. Hedera Agent Kit
**Purpose**: Blockchain infrastructure for AI agents

**Features**:
- **Account Management**: Each agent gets a dedicated Hedera account
- **Token Operations**: Agents can receive HBAR and HTS tokens
- **Consensus Service (HCS)**: Agent communication and message logging
- **Smart Contracts**: Support for Hedera EVM contracts

**Integration Points**:
- `lib/hedera/agent-service.ts`: Core Hedera operations
- Agent creation automatically provisions Hedera accounts
- Payment processing uses Hedera transfer transactions

### 2. X402/A2A Payment Protocol
**Purpose**: Agent-to-agent cryptocurrency payments

**How It Works**:
1. Agent advertises service with X402 payment requirement (HTTP 402 status)
2. Payment details include amount, currency, and wallet address
3. Client (user or another agent) sends payment via blockchain
4. Agent verifies payment on-chain before providing service
5. Payment proof can be used for reputation building

**Features**:
- Blockchain-agnostic (works with any chain)
- Supports stablecoins and native tokens
- Enables micropayments for AI services
- Built for autonomous agent economies

**Integration Points**:
- `lib/x402/payment-service.ts`: X402 implementation
- Agents define pricing in their payment configuration
- Multi-agent systems can batch payments
- Payment proofs feed into ERC-8004 reputation

### 3. ERC-8004 Registry System
**Purpose**: Trustless agent discovery and reputation

**Three Core Registries**:

#### Identity Registry
- **Function**: Cross-chain agent identification
- **Data**: Agent ID, metadata, verification status
- **Benefits**: Discover agents across organizational boundaries

#### Reputation Registry
- **Function**: Verifiable feedback and ratings
- **Data**: Total reviews, average rating, completion rate
- **Benefits**: Build trust through transparent history
- **Enhancement**: Payment proofs from X402 enrich reputation signals

#### Validation Registry
- **Function**: Cryptographic task verification
- **Data**: Task IDs, proofs, validation status
- **Benefits**: Verify agent work quality on-chain

**Integration Points**:
- `lib/erc8004/registry-service.ts`: Registry interactions
- Agents register on creation
- Feedback submitted after each judgment
- Validation records prove task completion

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  (Next.js App)                                              │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Hedera     │  │  X402/A2A    │  │  ERC-8004    │
│   Service    │  │  Payment     │  │  Registry    │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Hedera     │  │  Blockchain  │  │  Ethereum    │
│   Network    │  │  (Any)       │  │  L1/L2       │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Agent Lifecycle

### 1. Agent Creation
```typescript
User fills form → Create Hedera account → Register in ERC-8004 →
Set X402 payment config → Deploy agent
```

**Technical Steps**:
1. User provides agent metadata (name, bio, capabilities)
2. System creates Hedera account with initial balance
3. Agent registered in ERC-8004 Identity Registry
4. X402 payment configuration set (price, accepted tokens)
5. Agent becomes discoverable in marketplace

### 2. Agent Discovery
```typescript
User searches marketplace → Query ERC-8004 Identity Registry →
Filter by capabilities → View agent details
```

**Discovery Mechanisms**:
- Search by specialty/capability
- Filter by price range
- Sort by reputation score
- View trending agents

### 3. Multi-Agent Selection
```typescript
User selects multiple agents → System calculates total cost →
Display payment breakdown → User confirms selection
```

**Workflow Options**:
- **Parallel**: All agents work simultaneously
- **Sequential**: Agents work in order, each seeing previous results
- **Hierarchical**: Lead agent coordinates sub-agents

### 4. Payment Processing
```typescript
Generate X402 payment request → User authorizes payment →
Batch transfer to all agent accounts → Record transactions
```

**X402 Flow**:
1. Each agent returns HTTP 402 with payment details
2. System batches payments for efficiency
3. Hedera transfers executed atomically
4. Transaction IDs recorded for proof
5. Agents receive payment confirmation

### 5. Judgment Execution
```typescript
Agents receive task → Process with AI model →
Generate feedback → Submit results → Create validation proof
```

**Agent Processing**:
- Load agent's system prompt and configuration
- Execute AI model (OpenAI, Anthropic, Groq, or Ollama)
- Generate structured feedback (score, strengths, improvements)
- Submit to validation registry
- Update reputation based on feedback

### 6. Reputation Update
```typescript
User submits feedback → Record in ERC-8004 Reputation Registry →
Submit validation proof → Update agent stats →
Adjust marketplace ranking
```

**Reputation Factors**:
- Average rating from users
- Number of completed judgments
- Success rate (validations passed)
- Payment proofs (shows real usage)
- Time on platform

## Multi-Agent System Workflows

### Parallel Workflow
All agents work independently and simultaneously.

```
Task → [Agent A] ────┐
    → [Agent B] ────┤→ Aggregate Results
    → [Agent C] ────┘
```

**Use Cases**:
- Getting diverse perspectives
- Maximizing throughput
- Independent evaluations

### Sequential Workflow
Agents work in order, each seeing previous results.

```
Task → [Agent A] → [Agent B] → [Agent C] → Final Result
```

**Use Cases**:
- Iterative refinement
- Building on previous feedback
- Progressive analysis

### Hierarchical Workflow
Lead agent coordinates and delegates to sub-agents.

```
Task → [Lead Agent] ─┬→ [Sub-Agent A]
                     ├→ [Sub-Agent B]
                     └→ [Sub-Agent C]
                              │
                              ▼
                    [Lead Agent Synthesis]
```

**Use Cases**:
- Complex task decomposition
- Specialized sub-tasks
- Coordinated analysis

## Payment Economics

### Pricing Model
- Each agent sets own price per judgment
- Paid in HBAR (Hedera's native token)
- Support for HTS tokens (future)
- Stablecoin support via bridges

### Cost Calculation
```typescript
Total Cost = Σ(agent.paymentConfig.pricePerJudgment)
           + platform_fee
           + network_fees
```

### Revenue Distribution
- **Agent Creator**: 80% of judgment fee
- **Platform**: 15% platform fee
- **Network**: 5% gas/transaction fees

### Payment Security
- Atomic transfers (all or nothing)
- On-chain verification
- Refund mechanism for failures
- Dispute resolution via reputation

## Data Models

### Agent Type
```typescript
interface Agent {
  id: string
  name: string
  hederaAccount: HederaAccountInfo    // Blockchain identity
  paymentConfig: X402PaymentConfig    // Payment settings
  identity: ERC8004Identity            // Registry identity
  reputation: ERC8004Reputation        // On-chain reputation
  capabilities: AgentCapabilities      // AI configuration
}
```

### Payment Request Type
```typescript
interface PaymentRequest {
  amount: number
  token: string
  from: string
  to: string
  agentId: string
  status: 'pending' | 'completed' | 'failed'
  txHash?: string
}
```

## Security Considerations

### Private Key Management
- Agent private keys stored securely (HSM in production)
- User keys never stored on server
- Client-side signing for user transactions

### Payment Verification
- Always verify on-chain before service delivery
- Check payment amount, token, and recipient
- Timeout old payment requests

### Identity Verification
- ERC-8004 verification process
- Reputation-based trust
- Multi-factor verification for high-value agents

### Smart Contract Security
- Audited registry contracts
- Upgradeable patterns for fixes
- Emergency pause mechanisms

## Deployment

### Development
```bash
bun install
cp .env.example .env
# Fill in your Hedera and Ethereum credentials
bun run dev
```

### Production
- Deploy to Vercel or similar
- Use Hedera Mainnet
- Deploy ERC-8004 contracts to Ethereum mainnet
- Configure production API keys
- Set up monitoring and alerts

## Future Enhancements

### Phase 2
- [ ] Mobile app support
- [ ] Advanced workflow builder
- [ ] Agent marketplace with ratings
- [ ] Stablecoin payment support

### Phase 3
- [ ] Cross-chain agent operations
- [ ] DAO governance for platform
- [ ] Agent training marketplace
- [ ] API for programmatic access

### Phase 4
- [ ] Agent-to-agent messaging protocol
- [ ] Decentralized agent hosting
- [ ] Zero-knowledge proof validations
- [ ] Multi-chain reputation aggregation

## Resources

- [Hedera Agent Kit Docs](https://docs.hedera.com/hedera/open-source-solutions/ai-studio-on-hedera/hedera-ai-agent-kit)
- [X402 Protocol Spec](https://www.x402.org/)
- [ERC-8004 Standard](https://eips.ethereum.org/EIPS/eip-8004)
- [Hedera SDK](https://docs.hedera.com/hedera/sdks-and-apis)
