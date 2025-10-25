# Simplified Backend Implementation Guide

## 🗄️ Simplified Database Schema

### **Orchestrators Table (User Name = Orchestrator Name)**
```sql
CREATE TABLE orchestrators (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL, -- Orchestrator name (also used as user name)
  description TEXT,
  system_prompt TEXT NOT NULL,
  user_address VARCHAR(255) NOT NULL, -- Only store user address
  status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- AA Wallet Information (stored directly)
  wallet_account_id VARCHAR(255) NOT NULL UNIQUE,
  wallet_evm_address VARCHAR(255) NOT NULL UNIQUE,
  wallet_private_key_encrypted TEXT NOT NULL,
  
  -- Configuration
  max_discussion_rounds INT DEFAULT 3,
  round_timeout INT DEFAULT 300, -- seconds
  consensus_algorithm ENUM('majority', 'unanimous', 'weighted') DEFAULT 'majority',
  enable_discussion BOOLEAN DEFAULT true,
  convergence_threshold DECIMAL(3,2) DEFAULT 0.75,
  outlier_detection BOOLEAN DEFAULT true,
  
  -- Round Management
  rounds_completed INT DEFAULT 0,
  rounds_total INT DEFAULT 0,
  rounds_current INT DEFAULT 0,
  
  -- Metadata
  metadata JSON,
  INDEX idx_user_address (user_address),
  INDEX idx_status (status),
  INDEX idx_wallet_account_id (wallet_account_id),
  INDEX idx_wallet_evm_address (wallet_evm_address)
);
```

## 🔧 Simplified API Endpoints

### **1. Create Orchestrator with AA Wallet**
```typescript
// POST /api/orchestrator/create
interface CreateOrchestratorRequest {
  name: string; // Orchestrator name (also used as user name)
  description?: string;
  systemPrompt: string;
  userAddress: string; // Only user address needed
  initialFunding?: number;
  configuration?: {
    maxDiscussionRounds?: number;
    roundTimeout?: number;
    consensusAlgorithm?: 'majority' | 'unanimous' | 'weighted';
    enableDiscussion?: boolean;
    convergenceThreshold?: number;
    outlierDetection?: boolean;
  };
}

interface CreateOrchestratorResponse {
  success: boolean;
  orchestrator: {
    id: string;
    name: string; // Orchestrator name (also user name)
    description?: string;
    systemPrompt: string;
    userAddress: string;
    status: 'pending' | 'active' | 'inactive';
    configuration: OrchestratorConfiguration;
    rounds: {
      completed: number;
      total: number;
      current: number;
    };
    wallet: {
      accountId: string;
      evmAddress: string;
    };
    createdAt: string;
  };
  error?: string;
}
```

### **2. Get Orchestrator Status**
```typescript
// GET /api/orchestrator/{orchestratorId}
interface OrchestratorStatusResponse {
  success: boolean;
  orchestrator: {
    id: string;
    name: string; // Orchestrator name (also user name)
    description?: string;
    systemPrompt: string;
    userAddress: string;
    status: 'pending' | 'active' | 'inactive';
    configuration: OrchestratorConfiguration;
    rounds: {
      completed: number;
      total: number;
      current: number;
    };
    wallet: {
      accountId: string;
      evmAddress: string;
    };
    balance: number; // Fetched from Hedera Mirror Node
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}
```

## 🛠️ Simplified Service Functions

### **1. Orchestrator Service**
```typescript
// services/orchestratorService.ts
export class OrchestratorService {
  async createOrchestrator(request: CreateOrchestratorRequest): Promise<CreateOrchestratorResponse> {
    try {
      // 1. Create AA wallet
      const walletInfo = await this.hederaService.createAAWallet();
      const encryptedPrivateKey = await this.encryptionService.encrypt(walletInfo.privateKey);

      // 2. Create orchestrator with wallet info
      // User name = Orchestrator name, only store user address
      const orchestratorId = generateId();
      const orchestrator = await this.createOrchestratorRecord({
        id: orchestratorId,
        name: request.name, // Orchestrator name (also used as user name)
        description: request.description,
        systemPrompt: request.systemPrompt,
        userAddress: request.userAddress, // Only store address
        status: 'pending',
        walletAccountId: walletInfo.accountId,
        walletEvmAddress: walletInfo.evmAddress,
        walletPrivateKeyEncrypted: encryptedPrivateKey,
        configuration: request.configuration || this.getDefaultConfiguration(),
        roundsCompleted: 0,
        roundsTotal: 0,
        roundsCurrent: 0,
        createdAt: new Date().toISOString()
      });

      return {
        success: true,
        orchestrator: {
          id: orchestrator.id,
          name: orchestrator.name, // Orchestrator name (also user name)
          description: orchestrator.description,
          systemPrompt: orchestrator.systemPrompt,
          userAddress: orchestrator.userAddress,
          status: orchestrator.status,
          configuration: orchestrator.configuration,
          rounds: {
            completed: orchestrator.roundsCompleted,
            total: orchestrator.roundsTotal,
            current: orchestrator.roundsCurrent
          },
          wallet: {
            accountId: orchestrator.walletAccountId,
            evmAddress: orchestrator.walletEvmAddress
          },
          createdAt: orchestrator.createdAt
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getOrchestratorStatus(orchestratorId: string): Promise<OrchestratorStatusResponse> {
    try {
      const orchestrator = await this.getOrchestratorById(orchestratorId);
      const balance = await this.hederaService.getAccountBalance(orchestrator.walletAccountId);

      return {
        success: true,
        orchestrator: {
          ...orchestrator,
          wallet: {
            accountId: orchestrator.walletAccountId,
            evmAddress: orchestrator.walletEvmAddress
          },
          balance
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

## 🔄 Frontend Integration

### **1. Wallet Provider Usage**
```typescript
// In your components
const { transferToAAWallet } = useHederaWallet()

const handleTransfer = async () => {
  const result = await transferToAAWallet({
    accountId: '0.0.7125500',
    evmAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    name: 'My Orchestrator' // Orchestrator name (also user name)
  }, 1.0, 'testnet')
  
  if (result.success) {
    console.log('Transfer successful!', result.transactionHash)
  }
}
```

### **2. Dashboard Integration**
```typescript
// In dashboard page
const aaWalletInfo = {
  accountId: fundingOrchestrator.wallet.accountId,
  evmAddress: fundingOrchestrator.wallet.address,
  name: fundingOrchestrator.name // Use orchestrator name as user name
}

const result = await transferToAAWallet(aaWalletInfo, parseFloat(fundingAmount), 'testnet')
```

## 📝 Implementation Steps

1. **Setup Database**: Create orchestrators table with simplified schema
2. **Install Dependencies**: `npm install @hashgraph/sdk crypto`
3. **Create Services**: Implement simplified service classes
4. **Create API Routes**: Implement the REST endpoints
5. **Add Middleware**: Authentication, validation, error handling
6. **Test Integration**: Test with frontend wallet provider

## 🚀 Key Benefits

- **Simplified Schema**: No separate user name field
- **User Name = Orchestrator Name**: Clear relationship
- **Only Store Address**: Minimal user data storage
- **Cleaner Code**: Less fields to manage
- **Better Performance**: Fewer database operations

## 💡 Usage Pattern

### **Frontend**
```typescript
// Pass orchestrator name as 'name' field
const aaWalletInfo = {
  accountId: '0.0.7125500',
  evmAddress: '0x742d35...',
  name: 'My Orchestrator' // Orchestrator name (also user name)
}
```

### **Backend**
```typescript
// Store only user address, use orchestrator name as user name
const orchestrator = {
  name: 'My Orchestrator',        // Orchestrator name (also user name)
  user_address: '0x742d35...',    // Only store user address
  wallet_account_id: '0.0.7125500',
  wallet_evm_address: '0x742d35...'
}
```

This simplified approach uses the orchestrator name as the user name and only stores the user address, making the system much cleaner and easier to maintain! 🎉
