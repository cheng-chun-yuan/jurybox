# JuryBox Quick Start Guide

## 🚀 Get Started in 3 Minutes

### 1. Check System Health

```bash
bun test:health
```

This will verify:
- ✅ All files are present
- ✅ Dependencies installed
- ⚠️  Configuration status

---

### 2. Run Tests

```bash
# Run all tests
bun test

# Or run individual components
bun test:pinata      # IPFS service
bun test:hedera      # Hedera blockchain
bun test:registry    # ERC8004 agent registry
bun test:orchestrator # Multi-agent evaluation
```

---

### 3. Try Examples

```bash
# Simple registration example
bun example:register

# Full registration demo
bun demo:register
```

---

## 📁 Project Structure

```
jurybox-io/
├── lib/
│   ├── hedera/
│   │   ├── multi-agent-orchestrator.ts  # Main evaluation engine
│   │   ├── hcs-communication.ts         # Hedera message layer
│   │   ├── agent-service.ts             # Account & topic management
│   │   └── consensus-algorithms.ts      # 6 consensus methods
│   ├── erc8004/
│   │   ├── viem-registry-service.ts     # Agent registration
│   │   ├── viem-client.ts               # Hedera viem client
│   │   └── contract-addresses.ts        # Contract addresses
│   ├── ipfs/
│   │   └── pinata-service.ts            # IPFS metadata storage
│   └── x402/
│       └── payment-service.ts           # A2A payments
├── scripts/
│   ├── health-check.ts                  # System health check
│   ├── test-*.ts                        # Test scripts
│   ├── demo-agent-registration.ts       # Full demo
│   └── example-register-agent.ts        # Quick example
├── docs/
│   ├── SYSTEM_ARCHITECTURE.md           # Architecture details
│   └── ERC8004_HEDERA_DEPLOYMENT.md     # Deployment guide
├── TEST_RESULTS.md                      # Latest test results
├── TESTING.md                           # Testing guide
└── QUICK_START.md                       # This file
```

---

## 🧪 Available Commands

### Testing
```bash
bun test                  # Run all tests
bun test:health           # Health check
bun test:pinata           # Test IPFS service
bun test:hedera           # Test Hedera service
bun test:registry         # Test ERC8004 registry
bun test:orchestrator     # Test orchestrator
```

### Examples
```bash
bun example:register      # Quick registration example
bun demo:register         # Full registration demo
```

### Development
```bash
bun dev                   # Start Next.js dev server
bun build                 # Build for production
bun start                 # Start production server
```

---

## 🔧 Configuration

### Minimal Setup (Testing Mode)

Create `.env`:
```bash
cp .env.example .env
```

All services will work in mock mode!

### Full Setup (Production Mode)

Edit `.env` with real credentials:

```bash
# Hedera
HEDERA_ACCOUNT_ID=0.0.1234567     # From portal.hedera.com
HEDERA_PRIVATE_KEY=302e...         # Your private key
HEDERA_NETWORK=testnet

# IPFS
PINATA_API_KEY=your-key            # From pinata.cloud
PINATA_API_SECRET=your-secret

# AI Models (optional)
OPENAI_API_KEY=sk-...              # From openai.com
ANTHROPIC_API_KEY=sk-ant-...       # From anthropic.com
```

---

## 📊 System Status

Run `bun test:health` to see:

```
🏥 JuryBox System Health Check
════════════════════════════════════════════════════════════

✅ File Structure: All required files present
✅ Dependencies: All required dependencies installed
✅ Test Scripts: All test scripts available
⚠️  Environment Variables: Running in mock mode
```

---

## 🎯 Quick Examples

### Register an Agent

```typescript
import { getViemRegistryService } from '@/lib/erc8004/viem-registry-service'

const registry = getViemRegistryService()

// Create metadata
const metadata = {
  name: 'MyAgent',
  title: 'AI Assistant',
  capabilities: ['coding', 'analysis'],
  createdAt: Date.now(),
}

// Register (uploads to IPFS + stores on-chain)
const { agentId, txHash, ipfsUri } =
  await registry.registerAgent(metadata)

console.log('Agent ID:', agentId)
console.log('IPFS:', ipfsUri)
```

### Run Multi-Agent Evaluation

```typescript
import { getOrchestrator } from '@/lib/hedera/multi-agent-orchestrator'

const orchestrator = getOrchestrator()

const result = await orchestrator.executeEvaluation(
  request,    // Judgment request
  agents,     // Array of agents
  config      // Consensus config
)

console.log('Final Score:', result.consensusResult.finalScore)
console.log('HCS Topic:', result.topicId)
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [TEST_RESULTS.md](./TEST_RESULTS.md) | Latest test results & component status |
| [TESTING.md](./TESTING.md) | Comprehensive testing guide |
| [SYSTEM_ARCHITECTURE.md](./docs/SYSTEM_ARCHITECTURE.md) | System architecture details |
| [ERC8004_HEDERA_DEPLOYMENT.md](./docs/ERC8004_HEDERA_DEPLOYMENT.md) | Contract deployment guide |

---

## 🏗️ Key Components

### 1. Multi-Agent Orchestrator
Coordinates evaluation workflow with HCS-based communication.

**Features:**
- 6 consensus algorithms
- Multi-round discussion
- Outlier detection
- Reputation weighting

### 2. HCS Communication
Tamper-proof message passing between agents on Hedera.

**Features:**
- Topic creation
- Message submission
- Real-time subscriptions
- Historical queries

### 3. ERC8004 Registry
Decentralized agent identity and reputation system.

**Features:**
- On-chain registration
- IPFS metadata
- Reputation tracking
- Validation proofs

### 4. X402 Payments
Agent-to-agent payment protocol.

**Features:**
- Payment requirements
- Verification
- Batch processing
- Payment proofs

---

## ✅ Next Steps

1. **Run Health Check**
   ```bash
   bun test:health
   ```

2. **Run Tests**
   ```bash
   bun test
   ```

3. **Try Examples**
   ```bash
   bun example:register
   ```

4. **Review Results**
   ```bash
   cat TEST_RESULTS.md
   ```

5. **Configure for Production** (when ready)
   - Add real Hedera credentials
   - Deploy ERC8004 contracts
   - Configure Pinata IPFS
   - Add AI model keys

---

## 🆘 Troubleshooting

### Tests Failing?
```bash
# Check system status
bun test:health

# Review test results
cat TEST_RESULTS.md

# Check logs
bun test:pinata  # Or specific test
```

### Configuration Issues?
```bash
# Verify .env file exists
ls -la .env

# Check required variables
grep "HEDERA" .env
grep "PINATA" .env
```

### Need Help?
- See [TESTING.md](./TESTING.md) for detailed testing guide
- Check [TEST_RESULTS.md](./TEST_RESULTS.md) for component status
- Review [SYSTEM_ARCHITECTURE.md](./docs/SYSTEM_ARCHITECTURE.md) for architecture

---

## 🎉 You're Ready!

The JuryBox system is fully tested and ready to use. All core components are working:

- ✅ IPFS metadata storage
- ✅ Hedera blockchain integration
- ✅ ERC8004 agent registry
- ✅ Multi-agent orchestration
- ✅ Consensus algorithms
- ✅ Payment processing

**Happy Evaluating! 🧑‍⚖️**
