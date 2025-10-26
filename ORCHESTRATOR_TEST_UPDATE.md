# Orchestrator Test Call & Feedback System Update

## ✅ Changes Made

### 1. Updated Test API Call Format (`app/submit/page.tsx`)

**New Request Body:**
```typescript
{
  agentIds: number[],                    // Array of selected judge IDs
  maxRounds: number,                     // Default: 2
  consensusAlgorithm: string,            // Default: 'weighted_average'
  content: string,                       // The content to evaluate
  criteria: string[],                    // ['Accuracy', 'Clarity', 'Completeness', 'Relevance']
  userWalletAddress: string              // User's connected wallet address (for feedback auth)
}
```

**Example:**
```typescript
const response = await fetch(`${BACKEND_URL}/api/orchestrator/test`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentIds: [13, 14, 18],
    maxRounds: 2,
    consensusAlgorithm: "weighted_average",
    content: "Evaluate this test content for quality and accuracy.",
    criteria: ['Accuracy', 'Clarity', 'Completeness', 'Relevance'],
    userWalletAddress: address || formData.ownerAddress
  }),
})
```

### 2. Added Judge Feedback System

**New State Variables:**
```typescript
const [judgeFeedback, setJudgeFeedback] = useState<Record<number, { rating: number; comment: string }>>({})
const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
```

**Feedback Submission Function:**
```typescript
const handleSubmitFeedback = async (judgeId: number) => {
  const feedback = judgeFeedback[judgeId]

  await fetch(`${BACKEND_URL}/api/judges/${judgeId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rating: feedback.rating,        // 1-5 stars
      comment: feedback.comment,      // Optional text comment
      userAddress: address,           // User's wallet address
      evaluationId: testResults?.evaluationId || null
    }),
  })
}
```

### 3. Feedback UI Component

Added interactive feedback form for each judge after test results:

**Features:**
- ⭐ **Star Rating System** (1-5 stars)
  - Interactive clickable stars
  - Visual feedback on hover
  - Shows selected rating

- 💬 **Comment Section**
  - Optional text feedback
  - Textarea for detailed comments
  - Placeholder guidance

- 🔐 **Authentication**
  - Uses connected wallet address
  - Links feedback to specific evaluation
  - Verified on backend

**UI Location:**
- Appears in Step 3 (Test) after running test evaluation
- Shows below each judge's evaluation results
- Appears within each judge card

## 📊 Visual Design

```
┌─────────────────────────────────────────────────────────┐
│ Final Judge Evaluations                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Dr. Academic                              ⭐ 8.5       │
│  [Judge feedback and evaluation details...]             │
│                                                          │
│  ─────────────────────────────────────────────          │
│                                                          │
│  ⭐ Leave Feedback for this Judge                       │
│                                                          │
│  Rating (1-5)                                           │
│  ⭐ ⭐ ⭐ ⭐ ☆  4/5                                      │
│                                                          │
│  Comment (Optional)                                     │
│  ┌───────────────────────────────────────────┐         │
│  │ Share your experience with this judge...   │         │
│  │                                             │         │
│  └───────────────────────────────────────────┘         │
│                                                          │
│  [Submit Feedback]                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Backend Requirements

The backend needs to implement:

### 1. Updated `/api/orchestrator/test` Endpoint

**Expected Request:**
```json
{
  "agentIds": [13, 14, 18],
  "maxRounds": 2,
  "consensusAlgorithm": "weighted_average",
  "content": "Evaluate this test content...",
  "criteria": ["Accuracy", "Clarity", "Completeness", "Relevance"],
  "userWalletAddress": "0x742d35Cc..."
}
```

**Expected Response:**
```json
{
  "success": true,
  "evaluationId": 123,
  "topicId": "0.0.xxxxx",
  "consensusScore": 8.5,
  "judges": [...],
  "hcsMessages": [...]
}
```

### 2. New `/api/judges/:judgeId/feedback` Endpoint

**Expected Request:**
```json
{
  "rating": 4,
  "comment": "Great evaluation with detailed feedback!",
  "userAddress": "0x742d35Cc...",
  "evaluationId": 123
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully"
}
```

**Database Schema Suggestion:**
```sql
CREATE TABLE judge_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judge_id INT NOT NULL,
  user_address VARCHAR(255) NOT NULL,
  evaluation_id INT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (judge_id) REFERENCES judges(id),
  INDEX idx_judge_id (judge_id),
  INDEX idx_user_address (user_address)
);
```

## 🎯 User Flow

1. **Select Judges** → Choose judges from marketplace
2. **Configure Criteria** → Set evaluation parameters
3. **Run Test** → Submit test content with:
   - Judge IDs
   - Max rounds
   - Consensus algorithm
   - Content to evaluate
   - Evaluation criteria
   - User wallet address
4. **View Results** → See consensus score and individual evaluations
5. **Leave Feedback** → Rate and comment on each judge's performance
6. **Submit Feedback** → Authenticated via wallet address

## ✨ Features

- **Interactive Star Rating**: Click to select 1-5 stars
- **Optional Comments**: Provide detailed feedback
- **Wallet Authentication**: Links feedback to user's wallet
- **Individual Judge Feedback**: Separate feedback for each judge
- **Real-time Submission**: Immediate feedback submission
- **Clear Feedback State**: Clears form after successful submission

## 📝 Example Usage

```typescript
// User selects 4 stars and writes a comment
setJudgeFeedback({
  13: {
    rating: 4,
    comment: "Very thorough analysis with actionable insights!"
  }
})

// Submit feedback
await handleSubmitFeedback(13)

// Feedback is sent to: POST /api/judges/13/feedback
// With body:
{
  rating: 4,
  comment: "Very thorough analysis with actionable insights!",
  userAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  evaluationId: 123
}
```

## 🚀 Benefits

1. **Quality Control**: Users can rate judge performance
2. **Accountability**: Feedback tied to wallet addresses
3. **Improvement**: Judges can see user feedback
4. **Reputation**: Build trust through verified ratings
5. **Evaluation Tracking**: Link feedback to specific evaluations

---

**Status:** ✅ Frontend implementation complete
**Next:** Backend API endpoints for feedback submission and storage
