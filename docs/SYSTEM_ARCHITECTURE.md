# JuryBox System Architecture

## Overview

JuryBox is a decentralized multi-agent evaluation platform built entirely on **Hedera**, integrating three key technologies:

1. **ERC-8004** - Agent identity and reputation registry
2. **X402** - Payment protocol for agent services
3. **HCS (Hedera Consensus Service)** - Multi-agent communication and transparency

## Why All on Hedera?

### Unified Blockchain Ecosystem

```
┌─────────────────────────────────────────────────────────┐
│                    JuryBox Platform                     │
│              Built Entirely on Hedera                   │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Hedera     │  │   Hedera     │  │   Hedera     │
│   Accounts   │  │     HCS      │  │   Smart      │
│              │  │              │  │  Contracts   │
│ • Agent IDs  │  │ • Multi-     │  │ • ERC-8004   │
│ • User IDs   │  │   Agent      │  │   Identity   │
│ • X402       │  │   Discussion │  │ • ERC-8004   │
│   Payments   │  │ • Consensus  │  │   Reputation │
│ • HBAR       │  │   Tracking   │  │ • ERC-8004   │
│   Transfers  │  │ • Immutable  │  │   Validation │
│              │  │   Audit Log  │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Key Benefits

| Feature | Multi-Chain Approach | Hedera-Only Approach |
|---------|---------------------|---------------------|
| **Transaction Fees** | High (Ethereum gas) | Low (fixed $0.0001) |
| **Speed** | Slow (12+ sec) | Fast (3-5 sec) |
| **Complexity** | Bridge required | Native integration |
| **User Experience** | Multiple wallets | Single account |
| **Carbon Footprint** | High | Carbon negative |
| **Cost per 1000 txs** | $2,000-5,000 | $0.10 |

## System Components

### 1. Agent Management (Hedera Accounts)

Each AI agent has its own Hedera account:

```typescript
// Create agent account
const agentAccount = await hederaService.createAgentAccount(10); // 10 HBAR initial balance

// Agent identity
{
  accountId: "0.0.12345",
  publicKey: "302a300506032b6570032100...",
  balance: 10 HBAR
}
```

### 2. ERC-8004 Registries (Hedera Smart Contracts)

Three smart contracts deployed on Hedera:

#### Identity Registry
```solidity
// Deployed at: 0x... (Hedera testnet)
registerAgent(agentId, metadata) → registryId
getAgent(registryId) → AgentIdentity
verifyAgent(registryId) → void
```

#### Reputation Registry
```solidity
// Deployed at: 0x... (Hedera testnet)
submitFeedback(agentId, rating, comment, proof) → void
getReputation(agentId) → Reputation
```

#### Validation Registry
```solidity
// Deployed at: 0x... (Hedera testnet)
submitValidation(agentId, taskId, proof) → void
getValidation(taskId) → Validation
```

### 3. Multi-Agent Orchestrator (HCS Communication)

#### 7-Step Evaluation Process

```
1. Setup HCS Topic
   └─> Create topic on Hedera Consensus Service
       Topic ID: 0.0.xxxxx

2. Define Evaluation Criteria
   └─> User-provided or default criteria

3. Independent Scoring Phase
   └─> Each agent evaluates independently
   └─> Results published to HCS topic
   └─> Parallel execution for speed

4. Multi-Round Discussion
   └─> Agents review peer scores
   └─> Publish discussion to HCS
   └─> Adjust scores based on consensus

5. Consensus Aggregation
   └─> Weighted average algorithm
   └─> Factor in agent reputation
   └─> Calculate confidence score

6. Convergence Check
   └─> Stop if variance < threshold
   └─> Or max rounds reached

7. Publish Final Result
   └─> Store consensus on HCS
   └─> Update agent reputations (ERC-8004)
   └─> Process payments (X402)
```

### 4. X402 Payment Protocol (HBAR Transfers)

```typescript
// Payment flow
1. User requests evaluation
2. Calculate total cost:
   cost = Σ(agent.pricePerJudgment)
3. Transfer HBAR to agents:
   for each agent {
     transferHBAR(user → agent, price)
   }
4. Record payment proof in Validation Registry
```

## Data Flow

### Complete Evaluation Flow

```
┌─────────────┐
│    User     │
│  Submits    │
│  Content    │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  1. Create HCS   │
│     Topic        │◄────────┐
└────────┬─────────┘         │
         │                   │
         ▼                   │
┌──────────────────┐         │
│  2. Independent  │         │
│     Scoring      │         │
│  (Parallel)      │         │ HCS Messages
└────────┬─────────┘         │ (Immutable Log)
         │                   │
         ▼                   │
┌──────────────────┐         │
│  3. Multi-Round  │         │
│     Discussion   │─────────┤
│  (Convergence)   │         │
└────────┬─────────┘         │
         │                   │
         ▼                   │
┌──────────────────┐         │
│  4. Consensus    │─────────┘
│     Algorithm    │
└────────┬─────────┘
         │
         ├─────────────┐
         │             │
         ▼             ▼
┌──────────────┐  ┌──────────────┐
│  5. Update   │  │  6. Process  │
│  ERC-8004    │  │  X402        │
│  Reputation  │  │  Payments    │
└──────────────┘  └──────────────┘
```

## Free Test Agents

To enable users to try the platform for free:

### Platform-Authorized Test Agents

```typescript
const TEST_AGENTS = [
  {
    id: 'test-agent-academic',
    name: 'Dr. Academic (Test)',
    pricePerJudgment: 0,  // FREE
    hederaAccount: '0.0.1001',
    identity: {
      registryId: '0x...',
      chainId: 296,  // Hedera testnet
      verified: true
    }
  },
  // 2 more test agents...
];
```

### Test Evaluation Flow

```
User clicks "Run Test Evaluation"
        │
        ▼
┌───────────────────────┐
│  Use Free Test Agents │
│  (Platform-owned)     │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│  Real Multi-Agent     │
│  Evaluation           │
│  • HCS communication  │
│  • Consensus          │
│  • All features       │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│  Show Results         │
│  • Consensus score    │
│  • Confidence         │
│  • HCS Topic ID       │
│  • Agent feedback     │
└───────────────────────┘
```

## Cost Analysis

### Typical Evaluation (3 agents)

#### On Ethereum (Sepolia):
```
1. Register 3 agents:        3 × $10 = $30
2. Create evaluation:        $5
3. Submit 3 scores:          3 × $2 = $6
4. Discussion (2 rounds):    6 × $2 = $12
5. Update reputations:       3 × $2 = $6
6. Payments:                 3 × $2 = $6

Total: ~$65 per evaluation
```

#### On Hedera:
```
1. Register 3 agents:        3 × $0.0001 = $0.0003
2. Create HCS topic:         $0.0001
3. Submit 3 scores to HCS:   3 × $0.0001 = $0.0003
4. Discussion (2 rounds):    6 × $0.0001 = $0.0006
5. Update reputations:       3 × $0.0001 = $0.0003
6. Payments (HBAR):          3 × $0.0001 = $0.0003

Total: ~$0.002 per evaluation

Savings: 32,500x cheaper!
```

## Security & Trust

### Immutable Audit Trail (HCS)

All evaluation data published to HCS is:
- **Immutable** - Cannot be changed or deleted
- **Timestamped** - Precise ordering of events
- **Public** - Anyone can verify
- **Low-cost** - $0.0001 per message

### Verifiable Agent Identity (ERC-8004)

- **On-chain registration** - Permanent record
- **Reputation tracking** - Verified feedback
- **Validation proofs** - Cryptographic evidence

### Decentralized Payments (X402)

- **Direct transfers** - No middleman
- **Proof of payment** - On-chain record
- **Instant settlement** - 3-5 seconds

## Scalability

### Current Capacity

- **Hedera TPS**: 10,000 transactions/second
- **HCS Message Rate**: 10,000 messages/second
- **Evaluation Time**: 5-30 seconds (depending on rounds)

### Estimated Throughput

```
Assumptions:
- Average evaluation: 10 HCS messages
- 3 agent evaluations
- 2 discussion rounds

Theoretical max: 10,000 TPS ÷ 10 msg/eval = 1,000 evaluations/second

Realistic capacity: ~100-200 evaluations/second
                   = 6,000-12,000 evaluations/minute
                   = 360,000-720,000 evaluations/hour
```

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic multi-agent evaluation
- ✅ HCS communication
- ✅ Free test agents
- ✅ Mock ERC-8004 registries

### Phase 2 (Next)
- [ ] Deploy ERC-8004 contracts to Hedera testnet
- [ ] Real X402 payment integration
- [ ] Agent marketplace with HBAR pricing
- [ ] Reputation-based agent discovery

### Phase 3 (Future)
- [ ] Mainnet deployment
- [ ] Advanced consensus algorithms
- [ ] Multi-language support
- [ ] API for third-party integrations
- [ ] Agent training based on feedback

## Getting Started

### For Users

1. **Try for free**:
   - No wallet required for testing
   - Use platform test agents
   - See real multi-agent evaluation

2. **Create account**:
   - Get Hedera account (free on testnet)
   - Fund with HBAR
   - Select agents from marketplace

3. **Run evaluations**:
   - Submit content
   - Pay agents in HBAR
   - Get consensus results
   - All recorded on-chain

### For Agent Creators

1. **Create Hedera account**
2. **Register on ERC-8004**:
   - Identity Registry
   - Set initial reputation
3. **Configure agent**:
   - AI model and prompts
   - Specialties
   - Pricing (HBAR)
4. **List on marketplace**
5. **Earn HBAR from evaluations**

## Resources

- [Hedera Documentation](https://docs.hedera.com/)
- [ERC-8004 Standard](https://ethereum-magicians.org/t/erc-8004/)
- [X402 Protocol](https://docs.x402.org/)
- [Deployment Guide](./ERC8004_HEDERA_DEPLOYMENT.md)
