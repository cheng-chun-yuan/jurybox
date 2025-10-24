# JuryBox Testing Guide

## Quick Start

Run the health check to verify system status:

```bash
bun run scripts/health-check.ts
```

Run all tests:

```bash
# Individual tests
bun run scripts/test-pinata.ts
bun run scripts/test-hedera.ts
bun run scripts/test-registry.ts
bun run scripts/test-orchestrator.ts

# All tests (when test-all.ts is ready)
bun run scripts/test-all.ts
```

---

## Test Scripts

### 1. Health Check (`scripts/health-check.ts`)

**Purpose:** Quick system status check

**Checks:**
- ✅ Environment variables
- ✅ File structure
- ✅ Dependencies
- ✅ Test scripts

**Usage:**
```bash
bun run scripts/health-check.ts
```

**Expected Output:**
```
🏥 JuryBox System Health Check
════════════════════════════════════════════════════════════
...
⚠️  WARNING: System functional but incomplete configuration
```

---

### 2. Pinata/IPFS Test (`scripts/test-pinata.ts`)

**Purpose:** Test IPFS metadata storage

**Tests:**
1. Pinata connection (or mock mode)
2. Metadata upload
3. Metadata retrieval (if real IPFS)

**Usage:**
```bash
bun run scripts/test-pinata.ts
```

**Mock Mode:** Runs automatically if PINATA credentials not configured

**Real Mode:** Set valid `PINATA_API_KEY` and `PINATA_API_SECRET` in `.env`

---

### 3. Hedera Service Test (`scripts/test-hedera.ts`)

**Purpose:** Test Hedera blockchain integration

**Tests:**
1. Client initialization
2. Account balance check
3. HCS topic creation

**Usage:**
```bash
bun run scripts/test-hedera.ts
```

**Requirements:**
- Valid `HEDERA_ACCOUNT_ID` and `HEDERA_PRIVATE_KEY`
- Funded testnet account (get HBAR from https://portal.hedera.com/)

---

### 4. ERC8004 Registry Test (`scripts/test-registry.ts`)

**Purpose:** Test agent registration system

**Tests:**
1. Viem client initialization
2. Metadata preparation
3. IPFS upload workflow
4. Registration workflow validation

**Usage:**
```bash
bun run scripts/test-registry.ts
```

**Requirements:**
- Deployed ERC8004 contracts (see deployment guide)
- Contract addresses in `lib/erc8004/contract-addresses.ts`

---

### 5. Multi-Agent Orchestrator Test (`scripts/test-orchestrator.ts`)

**Purpose:** Test evaluation workflow

**Tests:**
1. Orchestrator initialization
2. Configuration validation
3. Mock agent setup
4. Judgment request preparation
5. Workflow validation
6. Consensus algorithms

**Usage:**
```bash
bun run scripts/test-orchestrator.ts
```

---

## Test Data

### Mock Agent Configuration

```typescript
{
  id: 'agent-1',
  name: 'GrammarExpert',
  capabilities: {
    modelProvider: 'openai',
    model: 'gpt-4',
    specialties: ['grammar', 'style', 'clarity']
  },
  paymentConfig: {
    pricePerJudgment: 0.5,
    acceptedTokens: ['HBAR']
  },
  reputation: {
    totalReviews: 50,
    averageRating: 8.5
  }
}
```

### Mock Judgment Request

```typescript
{
  id: 'test-request-1',
  content: 'Sample content for evaluation',
  criteria: ['Accuracy', 'Clarity', 'Technical Depth', 'Relevance'],
  requestedAgentIds: ['agent-1', 'agent-2']
}
```

---

## Environment Setup

### Minimal Configuration (Mock Mode)

```bash
# .env
HEDERA_NETWORK=testnet
```

All services will run in mock mode with simulated data.

### Full Configuration (Production Mode)

```bash
# .env
HEDERA_ACCOUNT_ID=0.0.1234567
HEDERA_PRIVATE_KEY=302e...
HEDERA_NETWORK=testnet

PINATA_API_KEY=your-api-key
PINATA_API_SECRET=your-api-secret

OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Troubleshooting

### Common Issues

#### 1. "HEDERA_PRIVATE_KEY not configured"

**Solution:** Add valid Hedera credentials to `.env`

```bash
# Get credentials from https://portal.hedera.com/
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e...
```

#### 2. "INVALID_SIGNATURE" when creating topics

**Solution:** Ensure private key matches account ID

#### 3. "Insufficient balance" errors

**Solution:** Fund account with testnet HBAR
- Visit https://portal.hedera.com/
- Use testnet faucet

#### 4. Pinata upload fails

**Solution:** Check API credentials or use mock mode

#### 5. Timeout errors

**Solution:** Increase timeout in test scripts or check network connection

---

## Integration Testing

### End-to-End Evaluation Test

```typescript
import { getOrchestrator } from '@/lib/hedera/multi-agent-orchestrator'
import { defaultTestAgents } from '@/lib/default-test-agents'

// Configuration
const config = {
  maxDiscussionRounds: 3,
  roundTimeout: 60000,
  consensusAlgorithm: 'weighted_average',
  enableDiscussion: true,
  convergenceThreshold: 0.5,
  outlierDetection: true,
}

// Judgment request
const request = {
  id: 'eval-001',
  creatorId: 'user-123',
  content: 'Your content to evaluate...',
  criteria: ['Accuracy', 'Clarity', 'Completeness', 'Relevance'],
  requestedAgentIds: agents.map(a => a.id),
  status: 'pending',
  createdAt: Date.now(),
}

// Execute evaluation
const result = await getOrchestrator().executeEvaluation(
  request,
  defaultTestAgents,
  config
)

console.log('Results:')
console.log('- Final Score:', result.consensusResult.finalScore)
console.log('- Confidence:', result.consensusResult.confidence)
console.log('- Rounds:', result.consensusResult.convergenceRounds)
console.log('- HCS Topic:', result.topicId)
```

---

## Performance Benchmarks

### Expected Test Durations

| Test | Duration | Notes |
|------|----------|-------|
| Health Check | < 1s | File system checks |
| Pinata Test | 2-5s | Mock mode: instant, Real: network dependent |
| Hedera Test | 5-10s | Network dependent |
| Registry Test | 2-3s | Mock mode |
| Orchestrator Test | 1-2s | Workflow validation only |

### Full Evaluation (Integration)

| Phase | Duration | Notes |
|-------|----------|-------|
| HCS Setup | 5-10s | Topic creation |
| Independent Scoring | 10-30s | Parallel AI calls |
| Discussion (3 rounds) | 30-60s | HCS message submission |
| Consensus | < 1s | Algorithm execution |
| Payment Processing | 5-10s | Hedera transfers |
| **Total** | **50-110s** | With 2-3 agents |

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: JuryBox Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Health Check
        run: bun run scripts/health-check.ts

      - name: Run Tests
        run: |
          bun run scripts/test-pinata.ts
          bun run scripts/test-registry.ts
          bun run scripts/test-orchestrator.ts
        env:
          HEDERA_NETWORK: testnet
```

---

## Test Coverage

### Component Coverage

| Component | Unit Tests | Integration Tests | E2E Tests |
|-----------|------------|-------------------|-----------|
| Pinata Service | ✅ | ✅ | ✅ |
| Hedera Service | ✅ | ⚠️ Partial | ⚠️ Needs credentials |
| ERC8004 Registry | ✅ | ⚠️ Partial | ⚠️ Needs deployment |
| Orchestrator | ✅ | ✅ | ⚠️ Needs credentials |
| HCS Communication | ✅ | ⚠️ Partial | ⚠️ Needs credentials |
| X402 Payments | ✅ | ⚠️ Partial | ⚠️ Needs credentials |

### Testing Roadmap

- [x] Create unit tests for all services
- [x] Create health check system
- [x] Add mock mode for offline testing
- [ ] Add integration tests with real Hedera testnet
- [ ] Add E2E evaluation workflow test
- [ ] Add performance benchmarks
- [ ] Add security testing
- [ ] Add load testing for multi-agent scenarios

---

## Next Steps

1. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **Run Health Check**
   ```bash
   bun run scripts/health-check.ts
   ```

3. **Run Individual Tests**
   ```bash
   bun run scripts/test-pinata.ts
   bun run scripts/test-hedera.ts
   bun run scripts/test-registry.ts
   bun run scripts/test-orchestrator.ts
   ```

4. **Review Results**
   ```bash
   cat TEST_RESULTS.md
   ```

5. **Deploy Contracts** (if needed)
   - See `docs/ERC8004_HEDERA_DEPLOYMENT.md`

6. **Run Full Integration Test**
   - Ensure all credentials are configured
   - Run complete evaluation workflow

---

## Support

For issues or questions:
- Check `TEST_RESULTS.md` for detailed component status
- Review `docs/SYSTEM_ARCHITECTURE.md` for architecture
- See `docs/ERC8004_HEDERA_DEPLOYMENT.md` for deployment

**Happy Testing! 🧪**
