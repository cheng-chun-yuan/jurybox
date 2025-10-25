# Backend Implementation Guide with User Name

## 🗄️ Updated Database Schema

### **Orchestrators Table (with User Name)**
```sql
CREATE TABLE orchestrators (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  user_address VARCHAR(255) NOT NULL,
  user_name VARCHAR(255), -- User name field (no duplication)
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
  INDEX idx_user_name (user_name),
  INDEX idx_status (status),
  INDEX idx_wallet_account_id (wallet_account_id),
  INDEX idx_wallet_evm_address (wallet_evm_address)
);
```

## 🔧 Updated API Endpoints

### **1. Create Orchestrator with AA Wallet (Updated)**
```typescript
// POST /api/orchestrator/create
interface CreateOrchestratorRequest {
  name: string;
  description?: string;
  systemPrompt: string;
  userAddress: string;
  userName?: string; // User name field (no duplication)
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
    name: string;
    description?: string;
    systemPrompt: string;
    userAddress: string;
    userName?: string; // User name field (no duplication)
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

### **2. Get Orchestrator Status (Updated)**
```typescript
// GET /api/orchestrator/{orchestratorId}
interface OrchestratorStatusResponse {
  success: boolean;
  orchestrator: {
    id: string;
    name: string;
    description?: string;
    systemPrompt: string;
    userAddress: string;
    userName?: string; // User name field (no duplication)
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

## 🛠️ Updated Service Functions

### **1. Orchestrator Service (Updated)**
```typescript
// services/orchestratorService.ts
export class OrchestratorService {
  async createOrchestrator(request: CreateOrchestratorRequest): Promise<CreateOrchestratorResponse> {
    try {
      // 1. Create AA wallet
      const walletInfo = await this.hederaService.createAAWallet();
      const encryptedPrivateKey = await this.encryptionService.encrypt(walletInfo.privateKey);

      // 2. Create orchestrator with wallet info and user name
      const orchestratorId = generateId();
      const orchestrator = await this.createOrchestratorRecord({
        id: orchestratorId,
        name: request.name,
        description: request.description,
        systemPrompt: request.systemPrompt,
        userAddress: request.userAddress,
        userName: request.userName, // Store user name
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
          name: orchestrator.name,
          description: orchestrator.description,
          systemPrompt: orchestrator.systemPrompt,
          userAddress: orchestrator.userAddress,
          userName: orchestrator.userName, // Return user name
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

### **1. Updated Wallet Provider Usage**
```typescript
// In your components
const { transferToAAWallet } = useHederaWallet()

const handleTransfer = async () => {
  const result = await transferToAAWallet({
    accountId: '0.0.7125500',
    evmAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    name: 'My Orchestrator AA Wallet',
    userName: 'John Doe' // Added user name
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
  name: fundingOrchestrator.name,
  userName: user?.name || 'Dashboard User' // Get from user context
}

const result = await transferToAAWallet(aaWalletInfo, parseFloat(fundingAmount), 'testnet')
```

## 📝 Implementation Steps

1. **Update Database Schema**: Add `user_name` field to orchestrators table
2. **Update API Interfaces**: Add `userName` to request/response interfaces
3. **Update Service Functions**: Include user name in orchestrator creation
4. **Update Frontend**: Pass user name when calling `transferToAAWallet`
5. **Test Integration**: Verify user name is logged and stored correctly

## 🚀 Key Benefits

- **User Tracking**: Know which user created each orchestrator
- **Better Logging**: Enhanced console logs with user information
- **Audit Trail**: Track user actions and transfers
- **Personalization**: Display user names in UI
- **Debugging**: Easier to debug issues with user context

The system now includes user name tracking throughout the AA wallet creation and transfer process! 🎉
