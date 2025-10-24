# ERC-8004 Registry Deployment on Hedera

This guide explains how to deploy the ERC-8004 registry contracts on Hedera Smart Contract Service.

## Why Hedera Instead of Ethereum?

### ✅ Benefits of Deploying on Hedera:

1. **Unified Ecosystem**
   - Agent accounts: Hedera accounts
   - Payments: HBAR via X402
   - Communication: Hedera Consensus Service (HCS)
   - Registry: ERC-8004 on Hedera Smart Contracts
   - **Everything on one chain!**

2. **Cost Efficiency**
   - Ethereum gas fees: Variable, can be $5-50+ per transaction
   - Hedera: Fixed ~$0.0001 per transaction
   - **1000x+ cheaper**

3. **Performance**
   - Hedera: 10,000 TPS, 3-5 second finality
   - Ethereum: 15-30 TPS, 12+ second finality
   - **300x+ faster**

4. **Environmental**
   - Hedera: Carbon negative
   - Ethereum: High energy consumption

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    JuryBox Platform                     │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Hedera     │  │   Hedera     │  │   Hedera     │
│   Accounts   │  │     HCS      │  │   Smart      │
│              │  │ (Consensus)  │  │  Contracts   │
│ Agent IDs    │  │ Multi-Agent  │  │  ERC-8004    │
│ X402 Payment │  │ Communication│  │  Registries  │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Contract Architecture

### 1. Identity Registry
```solidity
// Registers agents with unique IDs
contract IdentityRegistry {
    struct AgentIdentity {
        string agentId;
        string metadata;
        bool verified;
        uint256 registeredAt;
        address owner;
    }

    mapping(bytes32 => AgentIdentity) public agents;

    function registerAgent(string agentId, string metadata)
        external returns (bytes32);

    function verifyAgent(bytes32 registryId) external;
}
```

### 2. Reputation Registry
```solidity
// Tracks agent reputation and reviews
contract ReputationRegistry {
    struct Reputation {
        uint256 totalReviews;
        uint256 averageRating;
        uint256 completedTasks;
        uint256 successRate;
    }

    mapping(bytes32 => Reputation) public reputations;

    function submitFeedback(
        bytes32 agentId,
        uint256 rating,
        string comment,
        string paymentProof
    ) external;
}
```

### 3. Validation Registry
```solidity
// Stores proof of completed evaluations
contract ValidationRegistry {
    struct Validation {
        bytes32 agentId;
        bytes proof;
        bool validated;
        uint256 timestamp;
    }

    mapping(string => Validation) public validations;

    function submitValidation(
        bytes32 agentId,
        string taskId,
        bytes proof
    ) external;
}
```

## Deployment Steps

### Prerequisites

1. **Hedera Account**
   - Create account at https://portal.hedera.com/
   - Fund with HBAR for contract deployment (~10 HBAR for testnet)

2. **Development Environment**
   ```bash
   npm install -g @hashgraph/sdk
   npm install hardhat @nomicfoundation/hardhat-toolbox
   ```

### Step 1: Compile Contracts

```bash
# Create Hardhat project (if not already)
npx hardhat init

# Compile contracts
npx hardhat compile
```

### Step 2: Deploy to Hedera Testnet

Create `scripts/deploy-erc8004.js`:

```javascript
const { Client, FileCreateTransaction, ContractCreateTransaction } = require("@hashgraph/sdk");
const fs = require('fs');

async function deployContract(contractName, bytecode) {
    // Initialize Hedera client
    const client = Client.forTestnet();
    client.setOperator(
        process.env.HEDERA_ACCOUNT_ID,
        process.env.HEDERA_PRIVATE_KEY
    );

    // Upload bytecode to Hedera File Service
    const fileCreateTx = await new FileCreateTransaction()
        .setContents(bytecode)
        .execute(client);

    const fileReceipt = await fileCreateTx.getReceipt(client);
    const bytecodeFileId = fileReceipt.fileId;

    // Create contract
    const contractCreateTx = await new ContractCreateTransaction()
        .setBytecodeFileId(bytecodeFileId)
        .setGas(100000)
        .execute(client);

    const contractReceipt = await contractCreateTx.getReceipt(client);
    const contractId = contractReceipt.contractId;
    const evmAddress = contractId.toSolidityAddress();

    console.log(`${contractName} deployed!`);
    console.log(`Contract ID: ${contractId}`);
    console.log(`EVM Address: 0x${evmAddress}`);

    return `0x${evmAddress}`;
}

async function main() {
    // Load compiled contracts
    const identityBytecode = fs.readFileSync('artifacts/contracts/IdentityRegistry.sol/IdentityRegistry.json');
    const reputationBytecode = fs.readFileSync('artifacts/contracts/ReputationRegistry.sol/ReputationRegistry.json');
    const validationBytecode = fs.readFileSync('artifacts/contracts/ValidationRegistry.sol/ValidationRegistry.json');

    // Deploy all three registries
    const identityAddress = await deployContract('IdentityRegistry', identityBytecode);
    const reputationAddress = await deployContract('ReputationRegistry', reputationBytecode);
    const validationAddress = await deployContract('ValidationRegistry', validationBytecode);

    // Output for .env file
    console.log('\n=== Add to .env ===');
    console.log(`IDENTITY_REGISTRY_ADDRESS=${identityAddress}`);
    console.log(`REPUTATION_REGISTRY_ADDRESS=${reputationAddress}`);
    console.log(`VALIDATION_REGISTRY_ADDRESS=${validationAddress}`);
}

main().catch(console.error);
```

### Step 3: Deploy

```bash
# Deploy to Hedera testnet
node scripts/deploy-erc8004.js

# Output:
# IdentityRegistry deployed!
# Contract ID: 0.0.xxxxx
# EVM Address: 0x...
#
# ReputationRegistry deployed!
# Contract ID: 0.0.xxxxx
# EVM Address: 0x...
#
# ValidationRegistry deployed!
# Contract ID: 0.0.xxxxx
# EVM Address: 0x...
```

### Step 4: Update .env

```bash
# Add the deployed contract addresses to .env
IDENTITY_REGISTRY_ADDRESS=0x...
REPUTATION_REGISTRY_ADDRESS=0x...
VALIDATION_REGISTRY_ADDRESS=0x...
```

## Interacting with Contracts

### Using ethers.js (via Hedera JSON-RPC)

```typescript
import { ethers } from 'ethers';

// Connect to Hedera testnet via JSON-RPC
const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
const signer = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY, provider);

// Interact with contracts
const identityRegistry = new ethers.Contract(
    process.env.IDENTITY_REGISTRY_ADDRESS,
    IDENTITY_REGISTRY_ABI,
    signer
);

// Register an agent
const tx = await identityRegistry.registerAgent(
    'agent-123',
    JSON.stringify({ name: 'Dr. Academic', specialty: 'Research' })
);
await tx.wait();
```

### Using Hedera SDK Directly

```typescript
import { ContractExecuteTransaction, ContractFunctionParameters } from '@hashgraph/sdk';

const tx = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(100000)
    .setFunction(
        "registerAgent",
        new ContractFunctionParameters()
            .addString("agent-123")
            .addString(JSON.stringify({ name: 'Dr. Academic' }))
    )
    .execute(client);

const receipt = await tx.getReceipt(client);
```

## Cost Comparison

| Operation | Ethereum (Sepolia) | Hedera Testnet | Savings |
|-----------|-------------------|----------------|---------|
| Deploy Contract | ~$10-50 | ~$0.01 | 1000x |
| Register Agent | ~$2-5 | ~$0.0001 | 20,000x |
| Submit Feedback | ~$2-5 | ~$0.0001 | 20,000x |
| Query Data | Free (read) | Free (read) | Same |

## Integration Flow

```
User submits content for evaluation
        │
        ▼
┌───────────────────────┐
│  Multi-Agent          │
│  Orchestrator         │
│                       │
│  1. Create HCS Topic  │
│  2. Execute Agents    │
│  3. Consensus         │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│  ERC-8004 Registry    │
│  (on Hedera)          │
│                       │
│  - Update reputation  │
│  - Store validation   │
│  - Track metrics      │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│  X402 Payment         │
│  (HBAR transfer)      │
│                       │
│  - Pay agents         │
│  - Record on-chain    │
└───────────────────────┘
```

## Verification

After deployment, verify your contracts work:

```bash
# Test registration
node scripts/test-registry.js

# Expected output:
# ✓ Agent registered successfully
# ✓ Registry ID: 0x...
# ✓ Chain: Hedera Testnet (296)
# ✓ Gas used: ~100,000
# ✓ Cost: ~0.0001 HBAR
```

## Mainnet Deployment

When ready for production:

1. **Change network**:
   ```bash
   HEDERA_NETWORK=mainnet
   ```

2. **Update RPC URL** in code:
   ```typescript
   const rpcUrl = 'https://mainnet.hashio.io/api';
   ```

3. **Fund mainnet account** with HBAR

4. **Deploy** following same steps

5. **Update chainId** in code:
   ```typescript
   chainId: 295  // Hedera mainnet
   ```

## Resources

- [Hedera Smart Contract Service](https://hedera.com/smart-contract)
- [Hedera JSON-RPC Relay](https://github.com/hashgraph/hedera-json-rpc-relay)
- [HashIO (Free RPC)](https://swirldslabs.com/hashio/)
- [Hedera Portal](https://portal.hedera.com/)
- [ERC-8004 Standard](https://ethereum-magicians.org/t/erc-8004-agent-verifiable-identity-and-reputation/)

## Support

For issues or questions:
- GitHub: https://github.com/your-repo/issues
- Discord: https://hedera.com/discord
- Docs: https://docs.hedera.com/
