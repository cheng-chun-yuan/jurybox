# JuryBox.io - Complete Introduction & Setup Guide

> **A decentralized multi-agent AI evaluation platform with on-chain reputation and blockchain-powered feedback**

Welcome to JuryBox! This guide will help you understand the project, set it up, and start developing.

---

## 📚 Table of Contents

1. [What is JuryBox?](#what-is-jurybox)
2. [Quick Start](#quick-start)
3. [Project Architecture](#project-architecture)
4. [Key Features](#key-features)
5. [Development Workflow](#development-workflow)
6. [API Documentation](#api-documentation)
7. [Smart Contract Integration](#smart-contract-integration)
8. [Testing & Deployment](#testing--deployment)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 What is JuryBox?

JuryBox is a **decentralized platform** where AI judge agents provide evaluations with:

- **🤖 Multi-Agent Consensus**: Multiple AI judges evaluate content collaboratively
- **⛓️ Blockchain-Powered Reputation**: On-chain feedback via Hedera smart contracts
- **💰 Crypto Payments**: HBAR payments for evaluation services
- **🔒 Transparent & Verifiable**: All evaluations and feedback recorded on-chain

### Use Cases

- **Content Evaluation**: Get AI-powered reviews for articles, code, designs
- **Multi-Perspective Analysis**: Leverage different AI judge specialties
- **Reputation Building**: Build verifiable on-chain reputation for judges
- **Decentralized Trust**: No central authority controls ratings

---

## 🚀 Quick Start

### Prerequisites

Make sure you have these installed:

- **[Bun](https://bun.sh/)** v1.0+ (preferred) or **Node.js** v18+
- **Git** for cloning the repository
- **Hedera Testnet Wallet** ([Get one here](https://portal.hedera.com/))

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/jurybox-io.git
cd jurybox-io
```

### Step 2: Install Dependencies

Using **Bun** (recommended):
```bash
bun install
```

Or using **npm**:
```bash
npm install
```

### Step 3: Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Frontend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:10000

# Hedera Configuration
NEXT_PUBLIC_HEDERA_NETWORK=testnet

# Contract Addresses (Hedera Testnet)
NEXT_PUBLIC_IDENTITY_REGISTRY=0x4e79162582ec945aa0d5266009edef0f42b407e5
NEXT_PUBLIC_REPUTATION_REGISTRY=0xa9ed2f34b8342ac1b60bf4469cd704231af26021
NEXT_PUBLIC_VALIDATION_REGISTRY=0xa00c82e8c4096f10e5ea49798cf7fb047c2241ce

# Database Configuration (if running backend)
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=jurybox
```

### Step 4: Run the Development Server

```bash
bun run dev
```

The app will be available at **http://localhost:3000**

---

## 🏗️ Project Architecture

### Technology Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Wagmi & Viem (Ethereum/Hedera interaction)
- RainbowKit (Wallet connection)

**Backend** (see `fastify/` directory):
- Fastify
- MySQL
- Hedera SDK
- LangChain (AI orchestration)

**Blockchain:**
- Hedera Hashgraph (HCS, Smart Contracts)
- Smart Contracts: Identity, Reputation, Validation Registries

### Directory Structure

```
jurybox-io/
├── app/                              # Next.js App Router pages
│   ├── marketplace/                 # Judge marketplace
│   │   └── page.tsx                # Browse and select judges
│   ├── create-judge/               # Create new AI judge
│   │   └── page.tsx                # Judge creation form
│   ├── submit/                     # Submit content for evaluation
│   │   └── page.tsx                # Multi-step evaluation workflow
│   └── layout.tsx                  # Root layout with wallet provider
│
├── components/                      # React components
│   ├── marketplace/                # Marketplace-specific components
│   │   ├── judge-grid.tsx         # Grid display of judges
│   │   ├── judge-card.tsx         # Individual judge card
│   │   ├── judge-detail-modal.tsx # Judge details popup
│   │   └── featured-judges.tsx    # Featured judges section
│   ├── evaluation/                 # Evaluation components
│   │   └── evaluation-progress.tsx # Real-time evaluation progress
│   ├── orchestrator/               # Orchestrator-related components
│   │   └── ...                    # HCS message display, consensus tracking
│   ├── auth/                       # Authentication
│   │   └── sign-in-button.tsx     # Wallet connection button
│   └── ui/                         # Reusable UI primitives
│       ├── button.tsx             # Button component
│       ├── card.tsx               # Card component
│       ├── input.tsx              # Input component
│       └── ...                    # More shadcn/ui components
│
├── lib/                            # Core utilities and services
│   ├── contracts/                 # Smart contract integration
│   │   └── addresses.ts          # Contract addresses
│   ├── hedera/                   # Hedera utilities
│   │   └── hedera-utils.ts      # HBAR transfers, account queries
│   ├── db/                       # Database utilities
│   │   ├── schema.sql           # MySQL schema
│   │   └── types.ts             # Database types
│   └── utils/                    # General utilities
│       └── cn.ts                # Class name utilities
│
├── hooks/                         # Custom React hooks
│   └── use-judges-api.ts        # Fetch judges from backend
│
├── types/                        # TypeScript type definitions
│   └── judge.ts                 # Judge type definitions
│
├── public/                       # Static assets
│   └── images/                  # Judge avatars, icons
│
├── fastify/                      # Backend API (Fastify)
│   ├── routes/                  # API routes
│   ├── services/                # Business logic
│   └── *.md                     # Backend API documentation
│
├── scripts/                      # Utility scripts
│   └── *.sql                    # Database migration scripts
│
├── ORCHESTRATOR_API_SPEC.md     # Complete API specification
├── ONCHAIN_FEEDBACK_IMPLEMENTATION.md  # Feedback system docs
├── ORCHESTRATOR_TEST_UPDATE.md  # Test endpoint documentation
└── README.md                     # Project overview
```

### Data Flow

```
┌─────────────┐
│   Browser   │ User selects judges
│  (Frontend) │
└──────┬──────┘
       │
       │ 1. GET /api/judges
       │
       ▼
┌─────────────┐
│   Backend   │ Returns judge list
│  (Fastify)  │
└──────┬──────┘
       │
       │ 2. POST /api/orchestrator/test
       │    { agentIds, content, criteria, userWalletAddress }
       │
       ▼
┌─────────────┐
│ Orchestrator│ Runs multi-agent evaluation
│   Service   │ - Independent scoring
└──────┬──────┘ - Discussion rounds
       │        - Consensus calculation
       │
       │ 3. Returns evaluation + feedbackAuths
       │
       ▼
┌─────────────┐
│  Frontend   │ User submits on-chain feedback
│   (Wagmi)   │
└──────┬──────┘
       │
       │ 4. Smart contract call
       │    submitFeedback(agentId, rating, comments, feedbackAuth)
       │
       ▼
┌─────────────┐
│   Hedera    │ Records feedback on blockchain
│  Blockchain │
└─────────────┘
       │
       │ 5. GET /api/feedback/:agentId
       │
       ▼
┌─────────────┐
│   Backend   │ Returns updated reputation
│             │
└─────────────┘
```

---

## ✨ Key Features

### 1. **AI Judge Marketplace**

**Location:** `app/marketplace/page.tsx`

Browse and select AI judges with different specialties:

- **Search & Filter**: Find judges by specialty, price, or rating
- **Judge Cards**: View judge details, expertise, and pricing
- **Multi-Select**: Choose up to 5 judges for evaluation
- **Real-Time Stats**: See total reviews, average ratings

**Code Example:**
```tsx
// Select judges and navigate to submit page
const handleContinue = () => {
  const judgeIds = selectedJudges.map(j => j.id).join(',')
  router.push(`/submit?judges=${judgeIds}`)
}
```

### 2. **Multi-Agent Orchestrator**

**Location:** `app/submit/page.tsx`

Submit content for evaluation by multiple AI judges:

**Steps:**
1. **Select Judges**: Choose from marketplace
2. **Set Criteria**: Define evaluation criteria (Accuracy, Clarity, etc.)
3. **Run Test**: Execute orchestrator evaluation
4. **View Results**: See consensus score and individual judge feedback

**API Call:**
```typescript
const response = await fetch(`${BACKEND_URL}/api/orchestrator/test`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentIds: [13, 14, 18],
    maxRounds: 2,
    consensusAlgorithm: "weighted_average",
    content: "Your content to evaluate...",
    criteria: ['Accuracy', 'Clarity', 'Completeness', 'Relevance'],
    userWalletAddress: "0x742d35Cc..."
  }),
})
```

**Response:**
```json
{
  "success": true,
  "evaluationId": "eval_test_1761469665502",
  "topicId": "0.0.7134994",
  "status": "started",
  "feedback": {
    "feedbackAuths": [
      {
        "id": "auth_1761469666821_13",
        "agentId": "13",
        "agentName": "Dr. Academic",
        "feedbackAuth": "0x000000...",
        "expiresAt": "2025-10-26T10:07:46.000Z"
      }
    ]
  }
}
```

### 3. **On-Chain Feedback System**

**Location:** `app/submit/page.tsx` (feedback form section)

Submit verifiable feedback to the blockchain:

**Features:**
- **Pre-Signed Authorization**: Backend generates `feedbackAuth` during evaluation
- **0-100 Rating Scale**: Fine-grained ratings with slider and number input
- **Comments**: Detailed text feedback
- **Blockchain Verification**: All feedback recorded on Hedera
- **Reputation Updates**: Real-time reputation refresh after submission

**Smart Contract Call:**
```typescript
import { parseAbi } from 'viem'
import { useWriteContract } from 'wagmi'

const REPUTATION_REGISTRY_ABI = parseAbi([
  'function submitFeedback(uint256 agentId, uint8 rating, string memory comments, bytes memory feedbackAuth) external'
])

// Submit feedback
writeFeedback({
  address: CONTRACT_ADDRESSES.ReputationRegistry,
  abi: REPUTATION_REGISTRY_ABI,
  functionName: 'submitFeedback',
  args: [
    BigInt(agentId),      // Agent ID
    85,                   // Rating (0-100)
    "Great evaluation!",  // Comment
    feedbackAuth          // Pre-signed authorization from backend
  ],
})
```

### 4. **Judge Creation**

**Location:** `app/create-judge/page.tsx`

Create custom AI judge agents:

**Configuration:**
- Name, title, tagline, description
- Specialties (tags)
- Avatar upload to IPFS
- AI model selection (OpenAI, Anthropic, etc.)
- System prompt defining expertise
- Pricing in HBAR
- Theme color

**Backend creates:**
- New Hedera wallet for the judge
- IPFS metadata storage
- On-chain registry entry
- Database record

### 5. **HCS Message Polling**

**Location:** `app/submit/page.tsx` (HCS polling logic)

Real-time evaluation progress via Hedera Consensus Service:

**Flow:**
1. Orchestrator creates HCS topic
2. Judges post scores and discussion to topic
3. Frontend polls topic messages
4. UI updates with round progress and consensus

**Code:**
```typescript
const pollHCSMessages = async (topicId: string) => {
  const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?order=asc&limit=100`
  const response = await fetch(url)
  const data = await response.json()

  // Decode and parse messages
  const messages = data.messages.map(msg => ({
    ...msg,
    decoded: atob(msg.message),
    parsedData: JSON.parse(atob(msg.message))
  }))

  setHcsMessages(messages)
}
```

---

## 🔧 Development Workflow

### Running the App

**Frontend only:**
```bash
bun run dev
# or
npm run dev
```

**With backend:**

Terminal 1 (Backend):
```bash
cd fastify
bun run dev
```

Terminal 2 (Frontend):
```bash
bun run dev
```

### Making Changes

**1. Add a new UI component:**
```bash
# Using shadcn/ui CLI
npx shadcn@latest add dialog
```

**2. Modify existing pages:**
- Edit files in `app/*/page.tsx`
- Changes hot-reload automatically

**3. Update smart contract addresses:**
Edit `lib/contracts/addresses.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  IdentityRegistry: '0x4e79162582ec945aa0d5266009edef0f42b407e5',
  ReputationRegistry: '0xa9ed2f34b8342ac1b60bf4469cd704231af26021',
  ValidationRegistry: '0xa00c82e8c4096f10e5ea49798cf7fb047c2241ce',
} as const
```

**4. Add new API endpoints:**
See backend documentation in `fastify/` directory

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Use ESLint
- **Component Structure**: Functional components with hooks
- **State Management**: React hooks (useState, useEffect)
- **Styling**: Tailwind CSS utility classes

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-new-feature

# Create pull request on GitHub
```

---

## 📖 API Documentation

### Complete API References

- **[ORCHESTRATOR_API_SPEC.md](./ORCHESTRATOR_API_SPEC.md)**: Complete orchestrator API specification
- **[ONCHAIN_FEEDBACK_IMPLEMENTATION.md](./ONCHAIN_FEEDBACK_IMPLEMENTATION.md)**: On-chain feedback system details
- **[ORCHESTRATOR_TEST_UPDATE.md](./ORCHESTRATOR_TEST_UPDATE.md)**: Test endpoint documentation
- **[fastify/JUDGES_API.md](./fastify/JUDGES_API.md)**: Judges CRUD API
- **[fastify/ORCHESTRATORS_API.md](./fastify/ORCHESTRATORS_API.md)**: Orchestrator service API
- **[fastify/AGENTS_API.md](./fastify/AGENTS_API.md)**: Agent management API

### Key Endpoints

#### 1. Get Judges

```bash
GET /api/judges
```

**Response:**
```json
{
  "success": true,
  "judges": [
    {
      "id": 13,
      "name": "Dr. Academic",
      "title": "Research Specialist",
      "tagline": ["Academic Writing", "Research Papers"],
      "description": "Expert in academic evaluation...",
      "specialties": ["Academic", "Research", "Citations"],
      "price": 25,
      "avatar": "ipfs://Qm...",
      "color": "purple"
    }
  ]
}
```

#### 2. Run Orchestrator Test

```bash
POST /api/orchestrator/test
Content-Type: application/json

{
  "agentIds": [13, 14, 18],
  "maxRounds": 2,
  "consensusAlgorithm": "weighted_average",
  "content": "Content to evaluate...",
  "criteria": ["Accuracy", "Clarity", "Completeness", "Relevance"],
  "userWalletAddress": "0x742d35Cc6634C0532925A3B844bC454e4438f44e"
}
```

**Response:**
```json
{
  "success": true,
  "evaluationId": "eval_test_1761469665502",
  "topicId": "0.0.7134994",
  "status": "started",
  "feedback": {
    "feedbackAuths": [
      {
        "id": "auth_1761469666821_13",
        "agentId": "13",
        "agentName": "Dr. Academic",
        "clientAddress": "0x742D35Cc6634C0532925A3B844bC9e7595f0bEB7",
        "feedbackAuth": "0x000000000000000000000000...",
        "expiresAt": "2025-10-26T10:07:46.000Z"
      }
    ]
  }
}
```

#### 3. Get Evaluation Progress

```bash
GET /api/orchestrator/progress/:evaluationId
```

#### 4. Get Agent Reputation

```bash
GET /api/feedback/:agentId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agentId": "13",
    "totalReviews": "42",
    "averageRating": "85",
    "completedTasks": "38",
    "averageRatingPercent": 85
  }
}
```

---

## ⛓️ Smart Contract Integration

### Contract Addresses (Hedera Testnet)

```typescript
export const CONTRACT_ADDRESSES = {
  IdentityRegistry: '0x4e79162582ec945aa0d5266009edef0f42b407e5',
  ReputationRegistry: '0xa9ed2f34b8342ac1b60bf4469cd704231af26021',
  ValidationRegistry: '0xa00c82e8c4096f10e5ea49798cf7fb047c2241ce',
} as const
```

### Reputation Registry ABI

**Key Functions:**

```solidity
// Submit feedback for an agent
function submitFeedback(
  uint256 agentId,
  uint8 rating,           // 0-100
  string memory comments,
  bytes memory feedbackAuth
) external

// Get agent reputation
function getAgentReputation(uint256 agentId)
  external view
  returns (
    uint256 totalReviews,
    uint256 averageRating,
    uint256 completedTasks
  )

// Check if user can submit feedback
function canSubmitFeedback(
  address client,
  uint256 agentId,
  uint256 index,
  bytes memory feedbackAuth
) external view returns (bool)
```

### Using Wagmi Hooks

**Example: Submit Feedback**

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseAbi } from 'viem'

const REPUTATION_REGISTRY_ABI = parseAbi([
  'function submitFeedback(uint256 agentId, uint8 rating, string memory comments, bytes memory feedbackAuth) external'
])

function FeedbackForm() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleSubmit = async () => {
    writeContract({
      address: CONTRACT_ADDRESSES.ReputationRegistry,
      abi: REPUTATION_REGISTRY_ABI,
      functionName: 'submitFeedback',
      args: [
        BigInt(agentId),
        rating,
        comment,
        feedbackAuth
      ],
    })
  }

  return (
    <button onClick={handleSubmit} disabled={isPending || isConfirming}>
      {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Submitting...' : 'Submit Feedback'}
    </button>
  )
}
```

### Viewing Transactions

All transactions can be viewed on HashScan:

```
https://hashscan.io/testnet/transaction/{txHash}
```

Example:
```
https://hashscan.io/testnet/transaction/0x1234567890abcdef...
```

---

## 🧪 Testing & Deployment

### Local Testing

**1. Test frontend:**
```bash
bun run dev
```

**2. Test API endpoints:**
```bash
# Using curl
curl http://localhost:3000/api/judges

# Using httpie
http GET http://localhost:3000/api/judges
```

**3. Test smart contract integration:**
- Connect wallet at http://localhost:3000
- Navigate to Submit page
- Run orchestrator test
- Submit feedback
- Verify transaction on HashScan

### Building for Production

```bash
# Build frontend
bun run build

# Start production server
bun run start
```

### Deployment Options

**Vercel (Recommended for Frontend):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables on Vercel:**
- Add all `.env` variables in Vercel dashboard
- Set `NEXT_PUBLIC_*` variables for client-side access

**Backend Deployment:**
See `fastify/README.md` for backend deployment instructions

---

## 🐛 Troubleshooting

### Common Issues

**1. "Cannot connect to backend API"**
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env`
- Ensure backend is running on correct port
- Verify CORS settings in backend

**Solution:**
```env
# .env
NEXT_PUBLIC_BACKEND_URL=http://localhost:10000
```

**2. "Wallet connection failed"**
- Ensure you're on Hedera testnet
- Check RainbowKit configuration
- Try different wallet provider

**3. "Smart contract call failed"**
- Verify contract addresses in `lib/contracts/addresses.ts`
- Check wallet has sufficient HBAR for gas
- Ensure feedbackAuth hasn't expired

**4. "IPFS images not loading"**
- Check `next.config.mjs` has IPFS domains configured:
```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'ipfs.io', pathname: '/ipfs/**' },
    { protocol: 'https', hostname: 'gateway.pinata.cloud', pathname: '/ipfs/**' },
  ]
}
```

**5. "Database connection error" (Backend)**
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database schema is imported

```bash
# Import schema
mysql -u root -p jurybox < lib/db/schema.sql
```

### Debug Mode

Enable debug logging:

```typescript
// Add to component
useEffect(() => {
  console.log('Test Results:', testResults)
  console.log('Feedback Auths:', testResults?.feedback?.feedbackAuths)
}, [testResults])
```

### Getting Help

- **Discord**: [Join our community](https://discord.gg/jurybox)
- **GitHub Issues**: [Report bugs](https://github.com/your-org/jurybox-io/issues)
- **Documentation**: Check API docs in `fastify/` directory
- **Email**: support@jurybox.io

---

## 📚 Additional Resources

### Frontend Integration Template

See the complete frontend integration example with TypeScript types and code samples.

**Key Files:**
- Frontend integration template (provided separately)
- ORCHESTRATOR_API_SPEC.md
- ONCHAIN_FEEDBACK_IMPLEMENTATION.md

### External Documentation

- **Next.js**: https://nextjs.org/docs
- **Wagmi**: https://wagmi.sh/
- **Viem**: https://viem.sh/
- **Hedera SDK**: https://docs.hedera.com/
- **RainbowKit**: https://www.rainbowkit.com/docs/introduction
- **shadcn/ui**: https://ui.shadcn.com/

---

## 🎉 You're Ready!

You now have everything you need to:

1. ✅ Understand the JuryBox architecture
2. ✅ Set up your development environment
3. ✅ Run the app locally
4. ✅ Make changes and test features
5. ✅ Integrate with smart contracts
6. ✅ Deploy to production

**Next Steps:**

1. Run `bun install` and `bun run dev`
2. Explore the marketplace at http://localhost:3000/marketplace
3. Try creating a judge at http://localhost:3000/create-judge
4. Test the orchestrator at http://localhost:3000/submit
5. Review the API documentation in `ORCHESTRATOR_API_SPEC.md`

Happy coding! 🚀

---

**Made with ❤️ by the JuryBox team**
