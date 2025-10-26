// Database types

export interface Judge {
  id: number

  // Basic Information
  name: string                              // Agent Name
  title: string | null                      // Professional Title
  tagline: string | null                    // JSON array of tags
  description: string | null                // Biography / Description
  avatar: string | null                     // Agent Image URL or IPFS hash
  theme_color: string                       // Theme Color (hex code)

  // Specialties
  specialties: string | null                // JSON array of specialties

  // AI Model Configuration
  model_provider: string                    // Model Provider (OpenAI, Anthropic, etc.)
  model_name: string                        // Model Name (gpt-4, claude-3, etc.)
  system_prompt: string                     // System Prompt for AI
  temperature: number                       // Temperature (0.00 - 1.00)

  // Pricing & Performance
  price: number                             // Price per judgment

  // Payment Configuration (X402/A2A)
  wallet_address: string | null             // Hedera account ID or EVM address to receive payments
  payment_page_url: string | null           // X402/A2A payment page URL

  rating: number
  total_judgments: number

  // IPFS Metadata
  ipfs_cid: string | null                   // IPFS CID for agent metadata

  // Status
  status: 'active' | 'inactive'

  created_at: Date
  updated_at: Date
}

export interface Orchestrator {
  id: string
  name: string
  description: string | null
  system_prompt: string
  user_address: string
  status: 'active' | 'inactive' | 'pending'

  // Wallet
  wallet_account_id: string
  wallet_evm_address: string
  wallet_private_key_encrypted: string
  wallet_balance: number

  // Configuration
  max_discussion_rounds: number
  round_timeout: number
  consensus_algorithm: 'majority' | 'unanimous' | 'weighted'
  enable_discussion: boolean
  convergence_threshold: number
  outlier_detection: boolean

  // Rounds
  rounds_completed: number
  rounds_total: number
  rounds_current: number

  // HCS
  hcs_topic_id: string | null

  // Metadata
  metadata: Record<string, any> | null
  created_at: Date
  updated_at: Date
}

export interface Agent {
  id: string
  orchestrator_id: string
  judge_id: number
  name: string
  role: string | null
  status: 'active' | 'inactive' | 'busy'

  // Wallet
  agent_wallet_account_id: string | null
  agent_wallet_evm_address: string | null

  // Metrics
  total_evaluations: number
  average_score: number

  created_at: Date
  updated_at: Date
}

export interface OrchestratorJudge {
  id: number
  orchestrator_id: string
  judge_id: number
  added_at: Date
}

export interface Evaluation {
  id: string
  orchestrator_id: string
  content: string
  criteria: string | null

  // Results
  consensus_score: number | null
  confidence: number | null
  variance: number | null
  convergence_rounds: number | null
  algorithm: string | null

  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed'

  // HCS
  hcs_topic_id: string | null

  // Timing
  started_at: Date | null
  completed_at: Date | null
  created_at: Date
}

export interface EvaluationJudgment {
  id: number
  evaluation_id: string
  judge_id: number
  agent_id: string | null

  // Scores
  score: number
  initial_score: number | null
  final_score: number | null

  // Feedback
  feedback: string | null
  strengths: string | null // JSON
  improvements: string | null // JSON
  reasoning: string | null

  // Metadata
  round_number: number
  created_at: Date
}

// API Request/Response types

export interface CreateOrchestratorRequest {
  name: string
  description?: string
  systemPrompt: string
  userAddress: string
  judgeIds: number[]
  config?: {
    maxDiscussionRounds?: number
    roundTimeout?: number
    consensusAlgorithm?: 'majority' | 'unanimous' | 'weighted'
    enableDiscussion?: boolean
    convergenceThreshold?: number
    outlierDetection?: boolean
  }
  network?: 'mainnet' | 'testnet'
  initialFunding?: number
}

export interface CreateOrchestratorResponse {
  success: boolean
  orchestratorId?: string
  wallet?: {
    accountId: string
    address: string
    balance: number
  }
  error?: string
}

export interface GetJudgesResponse {
  success: boolean
  judges?: Judge[]
  error?: string
}

export interface GetOrchestratorResponse {
  success: boolean
  orchestrator?: Orchestrator & {
    judges: Judge[]
  }
  error?: string
}

export interface CreateJudgeRequest {
  name: string
  title?: string
  tagline?: string[]
  description?: string
  avatar?: string
  themeColor?: string
  specialties?: string[]
  modelProvider?: string
  modelName?: string
  systemPrompt: string
  temperature?: number
  price?: number
  walletAddress?: string
  ipfsCid?: string
}

export interface CreateJudgeResponse {
  success: boolean
  judgeId?: number
  ipfsCid?: string
  registryTxHash?: string | null
  paymentPageUrl?: string
  error?: string
}
