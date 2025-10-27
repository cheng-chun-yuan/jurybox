# Fastify Backend Implementation Checklist

## ✅ Completed (Frontend Setup)

- [x] Database schema created (`/lib/db/schema.sql`)
- [x] Database client and connection pool (`/lib/db/client.ts`)
- [x] TypeScript types and interfaces (`/lib/db/types.ts`)
- [x] Database models for all tables (`/lib/db/models.ts`)
- [x] API documentation for Judges
- [x] API documentation for Orchestrators
- [x] API documentation for Agents
- [x] Database setup guide

## 📋 Backend Implementation Tasks

### 1. Setup Fastify Project

```bash
# In your backend directory
npm init -y
npm install fastify @fastify/cors @fastify/env mysql2 nanoid dotenv
npm install -D typescript @types/node tsx
```

### 2. Create Project Structure

```
backend/
├── src/
│   ├── server.ts              # Main Fastify server
│   ├── config/
│   │   └── env.ts             # Environment configuration
│   ├── routes/
│   │   ├── judges.ts          # Judges API routes
│   │   ├── orchestrators.ts   # Orchestrators API routes
│   │   └── agents.ts          # Agents API routes
│   ├── services/
│   │   ├── hedera.ts          # Hedera SDK integration
│   │   └── encryption.ts      # Wallet key encryption
│   └── types/
│       └── index.ts           # Shared types
├── .env
├── package.json
└── tsconfig.json
```

### 3. Copy Database Files

Copy these files to your backend:
```bash
cp lib/db/client.ts backend/src/db/
cp lib/db/models.ts backend/src/db/
cp lib/db/types.ts backend/src/db/
```

### 4. Implement Core Server (`src/server.ts`)

```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { judgesRoutes } from './routes/judges'
import { orchestratorsRoutes } from './routes/orchestrators'
import { agentsRoutes } from './routes/agents'

const fastify = Fastify({ logger: true })

// Register plugins
await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
})

// Register routes
await fastify.register(judgesRoutes)
await fastify.register(orchestratorsRoutes)
await fastify.register(agentsRoutes)

// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: parseInt(process.env.PORT || '10000'),
      host: '0.0.0.0',
    })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

### 5. Implement Routes

Follow the documentation in:
- `fastify/JUDGES_API.md`
- `fastify/ORCHESTRATORS_API.md`
- `fastify/AGENTS_API.md`

### 6. Implement Hedera Service (`src/services/hedera.ts`)

```typescript
import { Client, AccountId, PrivateKey, AccountCreateTransaction, Hbar } from '@hashgraph/sdk'

export class HederaService {
  private client: Client

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.client = Client.forTestnet() // or Client.forMainnet()
    this.client.setOperator(
      AccountId.fromString(process.env.HEDERA_OPERATOR_ID!),
      PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY!)
    )
  }

  async createAAWallet() {
    const privateKey = PrivateKey.generateECDSA()
    const publicKey = privateKey.publicKey

    const transaction = new AccountCreateTransaction()
      .setKey(publicKey)
      .setInitialBalance(new Hbar(0))

    const receipt = await transaction.execute(this.client)
    const accountId = (await receipt.getReceipt(this.client)).accountId

    return {
      accountId: accountId!.toString(),
      evmAddress: accountId!.toSolidityAddress(),
      privateKey: privateKey.toString(),
    }
  }

  async getAccountBalance(accountId: string) {
    const balance = await new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(accountId))
      .execute(this.client)

    return balance.hbars.toTinybars().toNumber() / 100_000_000
  }
}
```

### 7. Implement Encryption Service (`src/services/encryption.ts`)

```typescript
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex') // 32 bytes

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return JSON.stringify({
    iv: iv.toString('hex'),
    data: encrypted,
    tag: authTag.toString('hex'),
  })
}

export function decrypt(encryptedData: string): string {
  const { iv, data, tag } = JSON.parse(encryptedData)

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(iv, 'hex')
  )
  decipher.setAuthTag(Buffer.from(tag, 'hex'))

  let decrypted = decipher.update(data, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
```

### 8. Environment Variables

Create `.env` in backend:

```env
# Server
PORT=10000
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=jurybox

# Hedera
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.your_account_id
HEDERA_OPERATOR_KEY=your_private_key

# Encryption (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=your_64_char_hex_key

# AI (if needed)
OPENAI_API_KEY=your_openai_key
```

### 9. Database Setup

```bash
# Create database and import schema
mysql -u root -p -e "CREATE DATABASE jurybox"
mysql -u root -p jurybox < ../lib/db/schema.sql
```

### 10. Testing

```bash
# Start backend
npm run dev

# Test judges endpoint
curl http://localhost:10000/api/judges

# Test create orchestrator
curl -X POST http://localhost:10000/api/orchestrators \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","systemPrompt":"Test prompt","userAddress":"0x123",...}'
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "fastify": "^4.x",
    "@fastify/cors": "^8.x",
    "@hashgraph/sdk": "^2.x",
    "mysql2": "^3.x",
    "nanoid": "^5.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "tsx": "^4.x"
  }
}
```

## 🚀 Next Steps

1. Set up database (follow `DATABASE_SETUP.md`)
2. Copy database files to backend
3. Implement Fastify server and routes
4. Add Hedera and encryption services
5. Test all endpoints
6. Update frontend to call backend at `http://localhost:10000`
