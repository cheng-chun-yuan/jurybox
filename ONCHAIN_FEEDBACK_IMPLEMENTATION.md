# On-Chain Feedback System Implementation

## Overview

The feedback system now interacts directly with the Hedera blockchain via the Reputation Registry smart contract. Users sign transactions with their wallet to submit feedback on-chain.

**Contract Addresses:**
```typescript
export const CONTRACT_ADDRESSES = {
  IdentityRegistry: '0x4e79162582ec945aa0d5266009edef0f42b407e5',
  ReputationRegistry: '0xa9ed2f34b8342ac1b60bf4469cd704231af26021',
  ValidationRegistry: '0xa00c82e8c4096f10e5ea49798cf7fb047c2241ce',
} as const
```

## Key Features

### 1. **Smart Contract Integration**

**Reputation Registry ABI:**
```typescript
const REPUTATION_REGISTRY_ABI = [{
  type: 'function',
  name: 'giveFeedback',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'agentId', type: 'uint256' },      // Registry agent ID
    { name: 'score', type: 'uint8' },          // 0-100 score
    { name: 'tag1', type: 'bytes32' },         // First tag (keccak256 hash)
    { name: 'tag2', type: 'bytes32' },         // Second tag (keccak256 hash)
    { name: 'feedbackUri', type: 'string' },   // IPFS URI
    { name: 'feedbackHash', type: 'bytes32' }, // IPFS content hash
    { name: 'feedbackAuth', type: 'bytes' },   // Agent owner signature
  ],
  outputs: [],
}]
```

### 2. **Feedback Flow (Simplified)**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Backend: Run orchestrator test                           │
│    POST /api/orchestrator/test                              │
│    → Returns test results with feedbackAuth for each judge  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. User reviews judge evaluations                           │
│    - Views consensus score and individual judge feedback    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User fills out feedback form for specific judge          │
│    - Star rating (1-5)                                       │
│    - Tags (max 2, optional)                                  │
│    - Comment (optional)                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Frontend: Convert rating to score (1-5 → 0-100)         │
│    score = floor((rating / 5) * 100)                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Frontend: Upload user feedback to IPFS                   │
│    POST /api/upload-feedback                                │
│    → Returns: ipfsUri, ipfsHash                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Frontend: Convert tags to bytes32                        │
│    tag1 = keccak256(toHex(tags[0] || 'general'))           │
│    tag2 = keccak256(toHex(tags[1] || 'evaluation'))        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Frontend: Get feedbackAuth from test results             │
│    judge.feedbackAuth (already in testResults)              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Frontend: Call ReputationRegistry smart contract         │
│    Address: 0xa9ed2f34b8342ac1b60bf4469cd704231af26021      │
│    writeFeedback({ address, abi, functionName, args })     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. User signs transaction in wallet                         │
│    (isPending state)                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. Transaction confirms on-chain                           │
│    (isConfirming → isSuccess)                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 11. Show HashScan link to view transaction                  │
│    https://hashscan.io/testnet/transaction/{txHash}         │
└─────────────────────────────────────────────────────────────┘
```

### 3. **Data Validation**

**Score Validation:**
- Input: 1-5 stars
- Conversion: `score = Math.floor((rating / 5) * 100)`
- Result: 0-100 (uint8)
- Examples:
  - 1 star → 20/100
  - 2 stars → 40/100
  - 3 stars → 60/100
  - 4 stars → 80/100
  - 5 stars → 100/100

**Tags Conversion:**
```typescript
const tag1 = tags[0]
  ? keccak256(toHex(tags[0]))
  : keccak256(toHex('general'))

const tag2 = tags[1]
  ? keccak256(toHex(tags[1]))
  : keccak256(toHex('evaluation'))
```

### 4. **Transaction States**

The UI handles all transaction states:

```typescript
// State management
const [currentFeedbackJudgeId, setCurrentFeedbackJudgeId] = useState<number | null>(null)
const [feedbackTxHash, setFeedbackTxHash] = useState<Record<number, string>>({})

// Wagmi hooks
const { writeContract, isPending, error } = useWriteContract()
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
```

**UI States:**
1. **Idle** - Form ready for input
2. **Pending** - "Waiting for wallet confirmation..."
3. **Confirming** - "Transaction confirming on-chain..."
4. **Success** - Shows HashScan link
5. **Error** - Displays error message

### 5. **UI Components**

**Feedback Form:**
```tsx
<div>
  {/* Star Rating */}
  <div className="flex items-center gap-2">
    {[1, 2, 3, 4, 5].map(rating => (
      <button onClick={() => setRating(rating)}>
        <Star className={rating <= selected ? 'fill-gold' : 'text-gray'} />
      </button>
    ))}
    <span>{rating}/5 (Score: {score}/100)</span>
  </div>

  {/* Tags Input */}
  <Input
    placeholder="e.g., helpful, detailed"
    onChange={e => setTags(e.target.value.split(',').slice(0, 2))}
  />

  {/* Comment */}
  <Textarea placeholder="Share your experience..." />

  {/* Transaction Status */}
  {isPending && <div>Waiting for wallet confirmation...</div>}
  {isConfirming && <div>Transaction confirming...</div>}

  {/* Submit Button */}
  <Button
    onClick={() => handleSubmitFeedback(judgeId, registryAgentId)}
    disabled={!rating || isPending || isConfirming}
  >
    {isPending ? 'Confirm in Wallet...' : 'Submit On-Chain Feedback'}
  </Button>

  {/* Success State */}
  {txHash && (
    <a href={`https://hashscan.io/testnet/transaction/${txHash}`}>
      View on HashScan
    </a>
  )}
</div>
```

## Backend Requirements

### 1. Upload Feedback to IPFS

**Endpoint:** `POST /api/upload-feedback`

**Request:**
```json
{
  "rating": 4,
  "comment": "Great evaluation!",
  "tags": ["helpful", "detailed"],
  "judgeId": 13,
  "evaluationId": 123,
  "timestamp": 1699999999999,
  "userAddress": "0x742d35Cc..."
}
```

**Response:**
```json
{
  "success": true,
  "ipfsUri": "ipfs://QmXXXXXXXXXXXXXXXX",
  "ipfsHash": "0xabcdef1234567890..."
}
```

### 2. Get Feedback Authorization

**Endpoint:** `POST /api/judges/:judgeId/feedback-auth`

**Request:**
```json
{
  "userAddress": "0x742d35Cc...",
  "feedbackHash": "0xabcdef1234567890..."
}
```

**Response:**
```json
{
  "success": true,
  "feedbackAuth": "0x1234567890abcdef..." // Signature from agent owner
}
```

**Implementation:**
```typescript
// Agent owner signs the feedback hash
const signature = await agentOwnerWallet.signMessage(feedbackHash)
return { feedbackAuth: signature }
```

## Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=0x...
```

## Smart Contract Call Example

```typescript
import { keccak256, toHex } from 'viem'

// Prepare parameters
const agentId = BigInt(13)
const score = 80 // (4/5) * 100
const tag1 = keccak256(toHex('helpful'))
const tag2 = keccak256(toHex('detailed'))
const feedbackUri = 'ipfs://QmXXXXXXXXXXXXXXXX'
const feedbackHash = '0xabcdef1234567890...'
const feedbackAuth = '0x1234567890abcdef...'

// Call contract
writeContract({
  address: REPUTATION_REGISTRY_ADDRESS,
  abi: REPUTATION_REGISTRY_ABI,
  functionName: 'giveFeedback',
  args: [agentId, score, tag1, tag2, feedbackUri, feedbackHash, feedbackAuth],
})
```

## User Experience

1. **Transparency**: All feedback is stored on-chain and verifiable
2. **Authenticity**: Wallet signatures ensure genuine feedback
3. **Immutability**: Feedback cannot be altered once submitted
4. **Reputation**: Builds verifiable reputation for judges
5. **Trust**: Users can verify feedback on HashScan

## Security Considerations

1. **Wallet Connection Required**: Users must have a connected wallet
2. **Gas Fees**: Users pay for transaction costs
3. **Authorization**: Agent owner must sign feedbackAuth
4. **IPFS Storage**: Detailed feedback stored off-chain
5. **Hash Verification**: On-chain hash verifies IPFS content

## Error Handling

```typescript
// Wallet not connected
if (!address) {
  alert('Please connect your wallet first')
  return
}

// Transaction rejected
if (error) {
  alert(`Transaction failed: ${error.message}`)
}

// IPFS upload failed
if (!ipfsResponse.ok) {
  throw new Error('Failed to upload feedback to IPFS')
}

// Authorization failed
if (!authResponse.ok) {
  throw new Error('Failed to get feedback authorization')
}
```

## Testing Checklist

- [ ] Star rating converts correctly to 0-100 score
- [ ] Tags convert to bytes32 using keccak256
- [ ] IPFS upload returns valid URI and hash
- [ ] FeedbackAuth signature is valid
- [ ] Wallet prompts for signature
- [ ] Transaction confirms on-chain
- [ ] HashScan link displays correctly
- [ ] Success state shows after confirmation
- [ ] Error states handle gracefully
- [ ] Can submit feedback for multiple judges

---

**Status:** ✅ Frontend implementation complete
**Next:** Backend API endpoints for IPFS upload and feedback authorization

