"use client"

import { useState, useEffect, useMemo } from "react"
import { Sparkles, Upload, FileText, CheckCircle2, ArrowRight, ArrowLeft, Star, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { SignInButton } from "@/components/auth/sign-in-button"
import { Logo } from "@/components/logo"
import { useJudgesByIds } from "@/hooks/use-judges-api"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { transferHBAR } from "@/lib/hedera/hedera-utils"
import type { Judge } from "@/types/judge"
import { parseAbi } from "viem"
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses"

// Updated ABI to match backend's submitFeedback function
const REPUTATION_REGISTRY_ABI = parseAbi([
  'function submitFeedback(uint256 agentId, uint8 rating, string memory comments, bytes memory feedbackAuth) external',
  'function getAgentReputation(uint256 agentId) external view returns (uint256 totalReviews, uint256 averageRating, uint256 completedTasks)',
])

// TypeScript interfaces matching backend response
interface FeedbackAuth {
  id: string
  agentId: string
  agentName: string
  clientAddress: string
  feedbackAuth: `0x${string}`
  issuedAt: string
  expiresAt: string
  indexLimit: number
  chainId: string
  identityRegistry: `0x${string}`
  signerAddress: `0x${string}`
  signature: `0x${string}`
}

interface OrchestratorTestResponse {
  success: boolean
  evaluationId: string
  topicId: string
  status: string
  message: string
  feedback: {
    message: string
    submitEndpoint: string
    getReputationEndpoint: string
    userWalletAddress: string
    feedbackAuths: FeedbackAuth[]
  }
}

const steps = [
  { id: 1, name: "Judges", icon: Sparkles },
  { id: 2, name: "Criteria", icon: FileText },
  { id: 3, name: "Test", icon: Upload },
  { id: 4, name: "Review", icon: CheckCircle2 },
]

export default function SubmitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [maxRounds, setMaxRounds] = useState(3)
  const [formData, setFormData] = useState({
    systemName: "",
    description: "",
    criteria: "",
    additionalNotes: "",
    testContent: "",
    budget: "",
    ownerAddress: "",
  })
  const [isTestingResults, setIsTestingResults] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [isCreatingOrchestrator, setIsCreatingOrchestrator] = useState(false)
  const [orchestratorResult, setOrchestratorResult] = useState<any>(null)
  const [isLoadingHederaAccount, setIsLoadingHederaAccount] = useState(false)
  const [aaWalletInfo, setAaWalletInfo] = useState<any>(null)
  const [isFundingWallet, setIsFundingWallet] = useState(false)
  const [fundingTxHash, setFundingTxHash] = useState<string | null>(null)
  const [hashscanUrl, setHashscanUrl] = useState<string | null>(null)
  const [hcsMessages, setHcsMessages] = useState<any[]>([])
  const [isPolling, setIsPolling] = useState(false)
  const [lastSequenceNumber, setLastSequenceNumber] = useState<number>(0)
  const [finalConsensusScore, setFinalConsensusScore] = useState<number | null>(null)
  const [currentRound, setCurrentRound] = useState<number>(0)
  const [judgeFeedback, setJudgeFeedback] = useState<Record<string, { rating: number; comment: string }>>({})
  const [currentFeedbackJudgeId, setCurrentFeedbackJudgeId] = useState<string | null>(null)
  const [feedbackTxHash, setFeedbackTxHash] = useState<Record<string, string>>({})
  const [agentReputations, setAgentReputations] = useState<Record<string, { totalReviews: string; averageRating: string; completedTasks: string }>>({})

  // Separate write contract hook for feedback
  const {
    writeContract: writeFeedback,
    data: feedbackHash,
    isPending: isFeedbackPending,
    error: feedbackWriteError
  } = useWriteContract()

  const {
    isLoading: isFeedbackConfirming,
    isSuccess: isFeedbackConfirmed
  } = useWaitForTransactionReceipt({
    hash: feedbackHash,
  })

  // Get selected judge IDs from URL params
  const judgeIds = useMemo(() => {
    const judgeIdsParam = searchParams.get('judges')
    if (!judgeIdsParam) {
      return []
    }
    return judgeIdsParam.split(',').map(Number)
  }, [searchParams])

  // Redirect to marketplace if no judges selected
  useEffect(() => {
    if (judgeIds.length === 0) {
      router.push('/marketplace')
    }
  }, [judgeIds, router])

  // Fetch judges from backend API
  const { judges: selectedJudges, loading: loadingJudges, error: judgesError } = useJudgesByIds(judgeIds)

  const totalCost = selectedJudges.reduce((sum, judge) => sum + judge.price, 0)

  // Function to derive Hedera account from EVM address
  const deriveHederaAccount = async (evmAddress: string) => {
    setIsLoadingHederaAccount(true)
    try {
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${evmAddress}`)
      if (!response.ok) {
        throw new Error('Failed to fetch Hedera account')
      }
      const data = await response.json()
      
      if (data.account) {
        setFormData(prev => ({
          ...prev,
          ownerAddress: data.account
        }))
      } else {
        throw new Error('No Hedera account found for this address')
      }
    } catch (error) {
      console.error('Error deriving Hedera account:', error)
      // Keep the EVM address as fallback
      setFormData(prev => ({
        ...prev,
        ownerAddress: evmAddress
      }))
    } finally {
      setIsLoadingHederaAccount(false)
    }
  }

  // Auto-derive Hedera account when wallet connects
  useEffect(() => {
    if (isConnected && address && !formData.ownerAddress) {
      deriveHederaAccount(address)
    }
  }, [isConnected, address, formData.ownerAddress])

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Create orchestrator system
      await handleCreateOrchestrator()
    }
  }

  const handleCreateOrchestrator = async () => {
    setIsCreatingOrchestrator(true)

    try {
      // Step 1: Create orchestrator (no agent wallet needed, will fund backend account directly)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orchestrator/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          config: {
            maxDiscussionRounds: 3,
            roundTimeout: 60000,
            enableDiscussion: true,
          },
          systemPrompt: `You are an AI orchestrator managing a panel of expert judges for content evaluation.`,
          network: "testnet",
          initialFunding: 0
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create orchestrator')
      }

      // Store orchestrator info for funding step
      setAaWalletInfo(data)
      setOrchestratorResult(data)

    } catch (error) {
      console.error('Error creating orchestrator:', error)
      alert(error instanceof Error ? error.message : 'Failed to create orchestrator system')
    } finally {
      setIsCreatingOrchestrator(false)
    }
  }

  const [isTransferring, setIsTransferring] = useState(false)

  const handleFundWallet = async () => {
    if (!address) return

    setIsTransferring(true)
    try {
      const fundingAmount = parseFloat(formData.budget)

      // Backend account ID that will receive the funds
      const backendAccountId = '0.0.7125500'

      console.log(`Funding orchestrator ${aaWalletInfo?.orchestratorId} with ${fundingAmount} HBAR`)
      console.log(`Recipient Account ID (Backend): ${backendAccountId}`)
      console.log(`From EVM Address: ${address}`)

      // Transfer HBAR directly to backend account
      const result = await transferHBAR(backendAccountId, fundingAmount, 'testnet', address)

      if (result.success) {
        console.log('Transfer successful:', result)
        setFundingTxHash(result.transactionId || '')
        setHashscanUrl(result.hashscanUrl || '')

        // Notify backend about successful funding
        if (aaWalletInfo?.orchestratorId) {
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orchestrator/fund`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orchestratorId: aaWalletInfo.orchestratorId,
              amount: fundingAmount,
              userAddress: address,
              transactionHash: result.transactionId
            }),
          })
        }

        // Redirect after successful transfer
        setTimeout(() => {
          router.push(`/orchestrator/${aaWalletInfo?.orchestratorId}`)
        }, 2000)
      } else {
        alert(`Funding failed: ${result.error}`)
      }

    } catch (error) {
      console.error('Error initiating funding:', error)
      alert('Failed to initiate funding transaction')
    } finally {
      setIsTransferring(false)
    }
  }

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      setFundingTxHash(hash)
      setIsFundingWallet(false)
      
      // Notify backend about successful funding
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orchestrator/fund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orchestratorId: aaWalletInfo?.orchestratorId,
          amount: parseFloat(formData.budget),
          userAddress: address,
          transactionHash: hash
        }),
      }).then(() => {
        // Redirect after successful funding
        setTimeout(() => {
          router.push(`/orchestrator/${aaWalletInfo?.orchestratorId}`)
        }, 2000)
      }).catch(error => {
        console.error('Error notifying backend:', error)
      })
    }
  }, [isConfirmed, hash, aaWalletInfo, formData.budget, address, router])

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      setIsFundingWallet(false)
      alert(`Transaction failed: ${writeError.message}`)
    }
  }, [writeError])

  // Handle feedback transaction confirmation
  useEffect(() => {
    if (isFeedbackConfirmed && feedbackHash && currentFeedbackJudgeId) {
      setFeedbackTxHash(prev => ({
        ...prev,
        [currentFeedbackJudgeId]: feedbackHash
      }))

      alert('Feedback submitted on-chain successfully!')

      // Clear feedback for this judge
      setJudgeFeedback(prev => {
        const newFeedback = { ...prev }
        delete newFeedback[currentFeedbackJudgeId]
        return newFeedback
      })

      setCurrentFeedbackJudgeId(null)
    }
  }, [isFeedbackConfirmed, feedbackHash, currentFeedbackJudgeId])

  // Handle feedback write errors
  useEffect(() => {
    if (feedbackWriteError) {
      alert(`Feedback transaction failed: ${feedbackWriteError.message}`)
      setCurrentFeedbackJudgeId(null)
    }
  }, [feedbackWriteError])

  const handleRunTest = async () => {
    if (!formData.testContent) return

    setIsTestingResults(true)
    setTestResults(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orchestrator/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentIds: selectedJudges.map(j => j.id),
          maxRounds: maxRounds,
          consensusAlgorithm: "weighted_average",
          content: formData.testContent,
          criteria: ['Accuracy', 'Clarity', 'Completeness', 'Relevance'],
          userWalletAddress: address || formData.ownerAddress
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run test evaluation')
      }

      setTestResults(data)
      console.log('Test evaluation response:', data)

      // Start polling HCS messages if we have a topic ID
      if (data.topicId) {
        setIsPolling(true)
      }

    } catch (error) {
      console.error('Error running test:', error)
      alert(error instanceof Error ? error.message : 'Failed to run test evaluation')
    } finally {
      setIsTestingResults(false)
    }
  }

  // Poll HCS topic messages - only fetch new messages
  const pollHCSMessages = async (topicId: string) => {
    try {
      // Build URL with sequence number filter to get only new messages
      let url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?order=asc&limit=100`
      if (lastSequenceNumber > 0) {
        url += `&sequencenumber=gt:${lastSequenceNumber}`
      }

      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        if (data.messages && data.messages.length > 0) {
          console.log(`[HCS] Fetched ${data.messages.length} new messages from topic ${topicId}`)

          // Step 1: Decode all messages first
          const decodedMessages = data.messages.map((msg: any) => ({
            ...msg,
            decoded: atob(msg.message)
          }))

          // Step 2: Build chunk map - look ahead to identify chunks
          const chunkMap = new Map<number, {total: number, startSeq: number}>()

          decodedMessages.forEach((msg: any, idx: number) => {
            const decoded = msg.decoded.trim()
            const chunkMatch = decoded.match(/^(\d+)\/(\d+)$/)

            if (chunkMatch) {
              const chunkNum = parseInt(chunkMatch[1])
              const totalChunks = parseInt(chunkMatch[2])

              if (chunkNum === 1) {
                // This marks the start of a chunked message
                chunkMap.set(msg.sequence_number, {
                  total: totalChunks,
                  startSeq: msg.sequence_number
                })
              }
            }
          })

          console.log(`[HCS] Found ${chunkMap.size} chunked message groups`)

          // Step 3: Group messages based on chunk map
          const messageGroups = new Map<string, any[]>()
          let i = 0

          while (i < decodedMessages.length) {
            const msg = decodedMessages[i]
            const decoded = msg.decoded.trim()

            // Check if this is a chunk indicator
            const isChunkIndicator = decoded.match(/^(\d+)\/(\d+)$/)

            if (isChunkIndicator && chunkMap.has(msg.sequence_number)) {
              // This is the start of a chunked message
              const chunkInfo = chunkMap.get(msg.sequence_number)!
              const groupKey = `chunk-${msg.sequence_number}`
              const chunks: any[] = []

              console.log(`[HCS] Processing chunked message starting at seq ${msg.sequence_number}, expecting ${chunkInfo.total} content chunks`)

              // Skip the chunk indicators and collect the actual content
              // Pattern: 1/N, content1, 2/N, content2, ..., N/N, contentN
              for (let chunkIdx = 0; chunkIdx < chunkInfo.total; chunkIdx++) {
                // Skip chunk indicator (i)
                i++

                // Get content message (i)
                if (i < decodedMessages.length) {
                  const contentMsg = decodedMessages[i]
                  const contentDecoded = contentMsg.decoded.trim()

                  // Make sure this isn't another chunk indicator
                  if (!contentDecoded.match(/^(\d+)\/(\d+)$/)) {
                    chunks.push(contentMsg)
                    console.log(`[HCS] Added chunk ${chunkIdx + 1}/${chunkInfo.total}: ${contentDecoded.substring(0, 50)}...`)
                  }
                }
                i++
              }

              // Go back one since the loop will increment
              i--

              messageGroups.set(groupKey, chunks)
              console.log(`[HCS] Completed chunk group ${groupKey} with ${chunks.length} chunks`)
            } else if (!isChunkIndicator) {
              // Standalone message (not a chunk indicator)
              const key = `single-${msg.sequence_number}`
              messageGroups.set(key, [msg])
              console.log(`[HCS] Standalone message at seq ${msg.sequence_number}`)
            }

            i++
          }

          console.log(`[HCS] Total message groups: ${messageGroups.size}`)

          // Step 3: Aggregate chunks and parse JSON
          const parsedMessages: any[] = []

          messageGroups.forEach((messages, groupKey) => {
            try {
              if (!messages || messages.length === 0) {
                console.warn(`[HCS] Empty message group: ${groupKey}`)
                return
              }

              // Combine all message contents
              const combinedContent = messages.map(m => m.decoded).join('')
              const firstMessage = messages[0]

              console.log(`[HCS] Processing group ${groupKey}: ${messages.length} messages, ${combinedContent.length} chars`)

              let parsedData = {}

              // Try to parse the combined JSON
              try {
                parsedData = JSON.parse(combinedContent)
                console.log(`[HCS] Successfully parsed JSON for ${groupKey}, type: ${parsedData.type}`)
              } catch (jsonError) {
                console.error(`[HCS] Failed to parse JSON for group ${groupKey}:`, jsonError instanceof Error ? jsonError.message : jsonError)
                console.error(`[HCS] Combined content (${combinedContent.length} chars):`, combinedContent.substring(0, 200))
                parsedData = {
                  type: 'error',
                  rawMessage: combinedContent.substring(0, 100),
                  error: 'Invalid JSON format'
                }
              }

              // Parse consensus timestamp correctly (format: seconds.nanoseconds)
              const [seconds, nanoseconds] = firstMessage.consensus_timestamp.split('.')
              const timestampMs = parseInt(seconds) * 1000 + parseInt(nanoseconds) / 1000000

              parsedMessages.push({
                ...firstMessage,
                parsedData,
                timestamp: new Date(timestampMs),
                sequenceNumber: firstMessage.sequence_number,
                uniqueId: `${topicId}-${firstMessage.sequence_number}`,
                isAggregated: messages.length > 1,
                totalChunks: messages.length,
                combinedContent: combinedContent.substring(0, 500) // Store preview for debugging
              })
            } catch (e) {
              console.error(`[HCS] Error processing message group ${groupKey}:`, e)
            }
          })


          if (parsedMessages.length > 0) {
            // Check for duplicates before adding using Map for better performance
            setHcsMessages(prev => {
              const messageMap = new Map(prev.map(m => [m.uniqueId, m]))

              let addedCount = 0
              parsedMessages.forEach((msg: any) => {
                if (!messageMap.has(msg.uniqueId)) {
                  messageMap.set(msg.uniqueId, msg)
                  addedCount++
                }
              })

              if (addedCount > 0) {
                console.log(`Adding ${addedCount} new HCS messages (filtered ${parsedMessages.length - addedCount} duplicates)`)
                // Convert back to array sorted by sequence number
                return Array.from(messageMap.values()).sort((a, b) => a.sequenceNumber - b.sequenceNumber)
              }
              return prev
            })

            // Update last sequence number to the highest we've seen
            const maxSequence = Math.max(...parsedMessages.map((m: any) => m.sequenceNumber))
            setLastSequenceNumber(prev => Math.max(prev, maxSequence))
          }
        }
      }
    } catch (error) {
      console.error('Error polling HCS messages:', error)
    }
  }

  // Effect to poll HCS messages - starts immediately and continues polling
  useEffect(() => {
    if (isPolling && testResults?.topicId) {
      // Start polling immediately
      pollHCSMessages(testResults.topicId)

      // Continue polling every 2 seconds for real-time updates
      const interval = setInterval(() => {
        pollHCSMessages(testResults.topicId)
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isPolling, testResults?.topicId])

  // Extract final consensus score and track current round from HCS messages
  useEffect(() => {
    if (hcsMessages.length > 0) {
      // Look for the final consensus message (type: 'final')
      const finalMessage = hcsMessages.find(msg => msg.parsedData?.type === 'final')
      if (finalMessage?.parsedData?.data?.score !== undefined) {
        setFinalConsensusScore(finalMessage.parsedData.data.score)
        console.log('Final consensus score extracted:', finalMessage.parsedData.data.score)
      }

      // Track the highest round number from messages
      const maxRoundNumber = Math.max(
        0,
        ...hcsMessages
          .filter(msg => msg.parsedData?.roundNumber !== undefined)
          .map(msg => msg.parsedData.roundNumber)
      )
      setCurrentRound(maxRoundNumber)
    }
  }, [hcsMessages])

  const handleSubmitFeedback = async (agentId: string) => {
    const feedback = judgeFeedback[agentId]
    if (!feedback || !feedback.rating) {
      alert('Please provide a rating (1-100)')
      return
    }

    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    // Get feedbackAuth from test results
    const feedbackAuth = testResults?.feedback?.feedbackAuths?.find((auth: FeedbackAuth) => auth.agentId === agentId)
    if (!feedbackAuth) {
      alert('Feedback authorization not found. Please run the test evaluation first.')
      return
    }

    // Validate feedbackAuth hasn't expired
    if (new Date(feedbackAuth.expiresAt) < new Date()) {
      alert('Feedback authorization has expired. Please run a new evaluation.')
      return
    }

    setCurrentFeedbackJudgeId(agentId)

    try {
      // Validate rating is 0-100
      const rating = Math.min(100, Math.max(0, feedback.rating))

      console.log('Submitting feedback:', {
        agentId,
        rating,
        comments: feedback.comment,
        feedbackAuthLength: feedbackAuth.feedbackAuth.length
      })

      // Call smart contract using new submitFeedback function
      writeFeedback({
        address: CONTRACT_ADDRESSES.ReputationRegistry as `0x${string}`,
        abi: REPUTATION_REGISTRY_ABI,
        functionName: 'submitFeedback',
        args: [
          BigInt(agentId),
          rating as any, // uint8
          feedback.comment || '',
          feedbackAuth.feedbackAuth, // Pre-encoded bytes from API
        ],
      })

    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit feedback')
      setCurrentFeedbackJudgeId(null)
    }
  }

  // Fetch agent reputation from API after feedback
  const fetchAgentReputation = async (agentId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback/${agentId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAgentReputations(prev => ({
            ...prev,
            [agentId]: data.data
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching agent reputation:', error)
    }
  }

  // Handle feedback transaction confirmation
  useEffect(() => {
    if (isFeedbackConfirmed && feedbackHash && currentFeedbackJudgeId) {
      console.log('✅ Feedback submitted successfully!', feedbackHash)

      // Store transaction hash
      setFeedbackTxHash(prev => ({
        ...prev,
        [currentFeedbackJudgeId]: feedbackHash
      }))

      // Fetch updated reputation
      fetchAgentReputation(currentFeedbackJudgeId)

      // Reset current feedback judge
      setTimeout(() => {
        setCurrentFeedbackJudgeId(null)
      }, 1000)
    }
  }, [isFeedbackConfirmed, feedbackHash, currentFeedbackJudgeId])

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push("/marketplace")
    }
  }

  const canProceed = () => {
    if (currentStep === 1) return selectedJudges.length > 0
    if (currentStep === 2) return formData.systemName && formData.criteria
    if (currentStep === 3) return true // Test step is optional
    if (currentStep === 4) {
      return formData.budget && parseFloat(formData.budget) >= totalCost && formData.ownerAddress
    }
    return true
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-40 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-xl font-bold bg-linear-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
              JuryBox
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <SignInButton variant="ghost" size="sm" />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10">
              <div
                className="h-full bg-brand-purple transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {steps.map((step) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? "bg-brand-purple border-brand-purple text-white"
                        : isActive
                          ? "bg-brand-purple/10 border-brand-purple text-brand-purple"
                          : "bg-surface-1 border-border text-foreground/60"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-sm font-medium ${isActive ? "text-brand-purple" : isCompleted ? "text-foreground" : "text-foreground/60"}`}
                  >
                    {step.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8 mb-8">
          {/* Loading State */}
          {loadingJudges && (
            <div className="flex flex-col items-center justify-center py-12">
              <Sparkles className="w-12 h-12 text-brand-purple animate-spin mb-4" />
              <p className="text-foreground/70">Loading judges...</p>
            </div>
          )}

          {/* Error State */}
          {judgesError && (
            <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30">
              <h4 className="font-medium mb-2 text-red-400">Error Loading Judges</h4>
              <p className="text-sm text-foreground/70">{judgesError}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/marketplace')}
              >
                Back to Marketplace
              </Button>
            </div>
          )}

          {/* Content - Only show when not loading and no error */}
          {!loadingJudges && !judgesError && currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Selected Judges</h2>
                <p className="text-foreground/70">Review the judges you selected from the marketplace</p>
              </div>

              <div className="space-y-3">
                {selectedJudges.map((judge) => (
                  <div
                    key={judge.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-surface-2 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={judge.avatar || `/placeholder.svg?height=48&width=48&query=${judge.name}`}
                        alt={judge.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span className="font-medium">{judge.name}</span>
                    </div>
                    <span className="font-mono font-bold text-brand-gold">${judge.price} / judgment</span>
                  </div>
                ))}
              </div>

              {/* Max Rounds Selection */}
              <div className="p-6 rounded-lg bg-surface-2 border border-border/50">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="maxRounds" className="text-base font-semibold">Maximum Discussion Rounds</Label>
                    <p className="text-sm text-foreground/60 mt-1">
                      Number of rounds judges can discuss to reach consensus
                    </p>
                  </div>
                  <div>
                    <Input
                      id="maxRounds"
                      type="number"
                      min="1"
                      max="5"
                      value={maxRounds}
                      onChange={(e) => setMaxRounds(parseInt(e.target.value) || 1)}
                      className={`w-32 ${maxRounds > 5 || maxRounds < 1 ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {maxRounds > 5 && (
                      <p className="text-xs text-red-500 mt-1.5">Maximum rounds cannot exceed 5</p>
                    )}
                    {maxRounds < 1 && (
                      <p className="text-xs text-red-500 mt-1.5">Minimum rounds is 1</p>
                    )}
                  </div>
                  <p className="text-xs text-foreground/60">
                    More rounds allow judges to refine their evaluations through discussion, but may increase processing time.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-brand-purple/5 border border-brand-purple/20">
                <p className="text-sm text-foreground/70">
                  <strong>Note:</strong> You're creating a reusable judge system. Once created, you can submit content for evaluation anytime via API or web interface.
                </p>
              </div>

              <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push('/marketplace')}>
                Change Judges Selection
              </Button>
            </div>
          )}

          {!loadingJudges && !judgesError && currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Configure Judge System</h2>
                <p className="text-foreground/70">Set up your reusable evaluation system</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="systemName">System Name *</Label>
                  <Input
                    id="systemName"
                    placeholder="e.g., Research Paper Evaluator"
                    value={formData.systemName}
                    onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-foreground/60 mt-2">A descriptive name for your judge system</p>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What types of content will this system evaluate?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="criteria">Evaluation Criteria *</Label>
                  <Textarea
                    id="criteria"
                    placeholder="e.g., Focus on clarity, technical accuracy, and practical applicability..."
                    value={formData.criteria}
                    onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                    className="mt-1.5 min-h-[200px]"
                  />
                  <p className="text-xs text-foreground/60 mt-2">Define what aspects judges should focus on</p>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific guidelines or context for the judges..."
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    className="mt-1.5 min-h-[120px]"
                  />
                </div>

                <div className="p-4 rounded-lg bg-brand-purple/5 border border-brand-purple/20">
                  <h4 className="font-medium mb-2 text-brand-purple">Suggested Criteria</h4>
                  <ul className="space-y-1 text-sm text-foreground/70">
                    <li>• Clarity and organization</li>
                    <li>• Technical accuracy and depth</li>
                    <li>• Originality and creativity</li>
                    <li>• Practical applicability</li>
                    <li>• Areas for improvement</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {!loadingJudges && !judgesError && currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Test Your Judge System (Optional)</h2>
                <p className="text-foreground/70">Try evaluating sample content to see how your judges will respond</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="testContent">Test Content</Label>
                  <Textarea
                    id="testContent"
                    placeholder="Paste sample content here to test your judge system..."
                    value={formData.testContent}
                    onChange={(e) => setFormData({ ...formData, testContent: e.target.value })}
                    className="mt-1.5 min-h-[200px]"
                  />
                  <p className="text-xs text-foreground/60 mt-2">This content will be evaluated by your selected judges</p>
                </div>

                <Button
                  onClick={handleRunTest}
                  disabled={!formData.testContent || isTestingResults}
                  className="w-full bg-brand-cyan hover:bg-brand-cyan/90"
                >
                  {isTestingResults ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Running Evaluation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Run Test Evaluation
                    </>
                  )}
                </Button>
              </div>

              {/* Test Results */}
              {testResults && (
                <div className="space-y-4 mt-6">
                  {/* HCS Topic Info - Show immediately when topic is created */}
                  {testResults.topicId && (
                    <div className="p-4 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-brand-cyan mb-1 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              HCS Topic Created
                            </h4>
                            <p className="text-sm text-foreground/70">All consensus messages are recorded on Hedera Consensus Service</p>
                          </div>
                          <a
                            href={`https://hashscan.io/testnet/topic/${testResults.topicId}/messages`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-brand-cyan/20 hover:bg-brand-cyan/30 text-brand-cyan rounded-lg transition-colors whitespace-nowrap"
                          >
                            <span className="font-mono text-sm">{testResults.topicId}</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <div className="text-xs text-foreground/60 bg-surface-2/50 p-3 rounded border border-border/30">
                          <strong className="text-brand-cyan">💡 Tip:</strong> Click the topic ID above to view all consensus messages in real-time on HashScan.
                          You can watch the judge agents communicate and reach consensus on-chain!
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Real-time HCS Messages Chat */}
                  {testResults.topicId && hcsMessages.length > 0 && (
                    <div className="p-6 rounded-lg bg-surface-2 border border-border/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-brand-cyan" />
                          Live Judge Discussion
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-foreground/60">Live • {hcsMessages.length} messages</span>
                        </div>
                      </div>
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {hcsMessages.map((msg, idx) => {
                          const type = msg.parsedData?.type
                          const data = msg.parsedData?.data
                          const agentName = msg.parsedData?.agentName || 'Judge'
                          const roundNumber = msg.parsedData?.roundNumber

                          // Determine message styling based on type
                          const getTypeStyle = () => {
                            switch(type) {
                              case 'initial':
                              case 'score':
                                return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-400' }
                              case 'discussion':
                                return { bg: 'bg-purple-500/10', border: 'border-purple-500/30', badge: 'bg-purple-500/20 text-purple-400' }
                              case 'adjustment':
                                return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', badge: 'bg-cyan-500/20 text-cyan-400' }
                              case 'final':
                                return { bg: 'bg-green-500/10', border: 'border-green-500/30', badge: 'bg-green-500/20 text-green-400' }
                              default:
                                return { bg: 'bg-surface-1', border: 'border-border/30', badge: 'bg-foreground/10 text-foreground/70' }
                            }
                          }

                          const style = getTypeStyle()

                          return (
                            <div
                              key={idx}
                              className={`p-4 rounded-lg ${style.bg} border ${style.border}`}
                            >
                              {/* Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-foreground">
                                    {agentName}
                                  </span>
                                  {type && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${style.badge} capitalize`}>
                                      {type}
                                    </span>
                                  )}
                                  {roundNumber !== undefined && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-foreground/10 text-foreground/70">
                                      Round {roundNumber}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-foreground/60">
                                  {msg.timestamp.toLocaleTimeString()}
                                </span>
                              </div>

                              {/* Initial Score or Score type */}
                              {(type === 'initial' || type === 'score') && data?.score !== undefined && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-brand-gold fill-brand-gold" />
                                    <span className="text-xl font-mono font-bold text-brand-gold">
                                      {typeof data.score === 'number' ? data.score.toFixed(2) : data.score}
                                    </span>
                                    {data.confidence && (
                                      <span className="text-xs text-foreground/60">
                                        ({(data.confidence * 100).toFixed(0)}% confidence)
                                      </span>
                                    )}
                                  </div>
                                  {data.reasoning && (
                                    <p className="text-sm text-foreground/80 pl-7">{data.reasoning}</p>
                                  )}
                                  {data.aspects && (
                                    <div className="mt-2 pl-7">
                                      <p className="text-xs font-medium text-foreground/70 mb-1">Scoring Aspects:</p>
                                      <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(data.aspects).map(([aspect, score]: [string, any]) => (
                                          <div key={aspect} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-surface-1 border border-border/30">
                                            <span className="text-foreground/70">{aspect}</span>
                                            <span className="font-mono font-medium">{typeof score === 'number' ? score.toFixed(2) : score}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Discussion */}
                              {type === 'discussion' && data?.discussion && (
                                <div className="pl-1">
                                  <p className="text-sm text-foreground/80 italic">"{data.discussion}"</p>
                                </div>
                              )}

                              {/* Adjustment */}
                              {type === 'adjustment' && data?.originalScore !== undefined && data?.adjustedScore !== undefined && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <Star className="w-4 h-4 text-foreground/40 fill-foreground/40" />
                                      <span className="font-mono text-foreground/60 line-through">
                                        {data.originalScore.toFixed(2)}
                                      </span>
                                    </div>
                                    <span className="text-foreground/60">→</span>
                                    <div className="flex items-center gap-2">
                                      <Star className="w-5 h-5 text-brand-cyan fill-brand-cyan" />
                                      <span className="text-lg font-mono font-bold text-brand-cyan">
                                        {data.adjustedScore.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                  {data.reasoning && (
                                    <p className="text-sm text-foreground/70 italic">{data.reasoning}</p>
                                  )}
                                </div>
                              )}

                              {/* Final Consensus */}
                              {type === 'final' && data?.score !== undefined && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Star className="w-6 h-6 text-brand-gold fill-brand-gold" />
                                    <span className="text-2xl font-mono font-bold text-brand-gold">
                                      {typeof data.score === 'number' ? data.score.toFixed(2) : data.score}
                                    </span>
                                    <span className="text-sm text-foreground/60 ml-2">Final Consensus</span>
                                  </div>
                                  {data.reasoning && (() => {
                                    try {
                                      const reasoningData = JSON.parse(data.reasoning)
                                      return (
                                        <div className="text-sm space-y-1 text-foreground/70">
                                          {reasoningData.individualScores && (
                                            <div className="mt-2">
                                              <p className="font-medium text-foreground/80 mb-1">Individual Scores:</p>
                                              <div className="flex gap-3 flex-wrap">
                                                {Object.entries(reasoningData.individualScores).map(([id, score]: [string, any]) => (
                                                  <span key={id} className="px-2 py-1 rounded bg-surface-1 border border-border/30 font-mono text-xs">
                                                    Judge {id}: {typeof score === 'number' ? score.toFixed(2) : score}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {reasoningData.totalRounds && (
                                            <p className="text-xs text-foreground/60 mt-2">
                                              Consensus reached after {reasoningData.totalRounds} rounds
                                            </p>
                                          )}
                                        </div>
                                      )
                                    } catch (e) {
                                      return <p className="text-sm text-foreground/70">{data.reasoning}</p>
                                    }
                                  })()}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Consensus Summary - Only show if we have final consensus */}
                  {finalConsensusScore !== null && (
                    <div className="p-6 rounded-lg bg-linear-to-br from-brand-purple/10 to-brand-cyan/10 border border-brand-purple/30">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-foreground/60">Consensus Score</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-6 h-6 text-brand-gold fill-brand-gold" />
                            <span className="text-3xl font-mono font-bold text-brand-gold">
                              {finalConsensusScore.toFixed(2)}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                              Final
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-foreground/60">Rounds Completed</span>
                          <div className="text-2xl font-mono font-bold text-brand-purple mt-1">
                            {currentRound}/{maxRounds}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground/60">Algorithm:</span>
                          <span className="font-mono font-medium">{testResults.algorithm ?? testResults.consensusAlgorithm ?? 'weighted_average'}</span>
                        </div>
                        {testResults.variance !== undefined && (
                          <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-foreground/60">Variance:</span>
                            <span className="font-mono font-medium">{testResults.variance.toFixed(3)}</span>
                          </div>
                        )}
                        {testResults.topicId && (
                          <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-foreground/60">HCS Topic:</span>
                            <a
                              href={`https://hashscan.io/testnet/topic/${testResults.topicId}/messages`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-brand-cyan hover:text-brand-cyan/80 underline flex items-center gap-1"
                            >
                              {testResults.topicId}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* HCS Message Timeline */}
                  {testResults.hcsMessages && testResults.hcsMessages.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-cyan" />
                        HCS Consensus Timeline
                      </h3>
                      {testResults.hcsMessages.map((round: any, roundIdx: number) => (
                        <Card key={roundIdx} className="p-4 bg-surface-1">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">
                              {round.roundNumber === 0 ? 'Initial Scoring' : `Discussion Round ${round.roundNumber}`}
                            </h4>
                            <span className="text-xs text-foreground/60 font-mono">
                              {round.duration}ms
                            </span>
                          </div>
                          <div className="space-y-2">
                            {round.messages.map((msg: any, msgIdx: number) => (
                              <div
                                key={msgIdx}
                                className="p-3 rounded-lg bg-surface-2 border border-border/30"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{msg.agentName}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple">
                                      {msg.type}
                                    </span>
                                  </div>
                                  <span className="text-xs text-foreground/60 font-mono">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                {msg.data.score !== undefined && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
                                    <span className="font-mono font-bold">{msg.data.score.toFixed(2)}</span>
                                    {msg.data.reasoning && (
                                      <span className="text-foreground/70 text-xs ml-2">
                                        {msg.data.reasoning}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {msg.data.content && (
                                  <p className="text-sm text-foreground/70">{msg.data.content}</p>
                                )}
                                {msg.data.adjustedScore !== undefined && (
                                  <div className="text-sm text-foreground/70">
                                    Adjusted: {msg.data.originalScore.toFixed(2)} → {msg.data.adjustedScore.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Judge Feedback - Using FeedbackAuth from orchestrator response */}
                  {testResults?.feedback?.feedbackAuths && testResults.feedback.feedbackAuths.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Submit Feedback for Judges</h3>
                      <p className="text-sm text-foreground/60">
                        Rate the judges' performance on-chain. Your feedback is stored on the Hedera blockchain.
                      </p>
                      {testResults.feedback.feedbackAuths.map((feedbackAuth: FeedbackAuth) => {
                        const agentId = feedbackAuth.agentId
                        const selectedJudge = selectedJudges.find(j => j.id.toString() === agentId)
                        return (
                          <Card key={agentId} className="p-4 bg-surface-1">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium">{feedbackAuth.agentName}</h4>
                                <p className="text-xs text-foreground/60">Agent ID: {agentId}</p>
                              </div>
                              {selectedJudge && (
                                <div className="text-sm text-foreground/70">
                                  <span className="font-medium">Price:</span> {selectedJudge.price} HBAR
                                </div>
                              )}
                            </div>

                            {/* Feedback Auth Info */}
                            <div className="mb-4 p-3 bg-surface-2/50 rounded-lg text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-foreground/60">Authorization:</span>
                                <span className="text-green-400">✓ Valid</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-foreground/60">Expires:</span>
                                <span className="font-mono">{new Date(feedbackAuth.expiresAt).toLocaleTimeString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-foreground/60">Chain ID:</span>
                                <span className="font-mono">{feedbackAuth.chainId}</span>
                              </div>
                            </div>

                            {/* Feedback Form */}
                            <div className="mt-4 pt-4 border-t border-border/30">
                              <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4 text-brand-gold" />
                                Submit On-Chain Feedback
                              </h5>

                              {/* Show success state if feedback already submitted */}
                              {feedbackTxHash[agentId] ? (
                                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    <span className="font-medium text-green-400">Feedback Submitted On-Chain!</span>
                                  </div>
                                  <p className="text-xs text-foreground/60 mb-2">Transaction Hash:</p>
                                  <a
                                    href={`https://hashscan.io/testnet/transaction/${feedbackTxHash[agentId]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-mono text-brand-cyan hover:text-brand-cyan/80 underline flex items-center gap-1"
                                  >
                                    {feedbackTxHash[agentId]}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>

                                  {/* Show updated reputation */}
                                  {agentReputations[agentId] && (
                                    <div className="mt-3 pt-3 border-t border-green-500/20">
                                      <p className="text-xs font-medium text-green-400 mb-1">Updated Reputation:</p>
                                      <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                          <p className="text-foreground/60">Total Reviews</p>
                                          <p className="font-bold text-brand-cyan">{agentReputations[agentId].totalReviews}</p>
                                        </div>
                                        <div>
                                          <p className="text-foreground/60">Avg Rating</p>
                                          <p className="font-bold text-brand-gold">{agentReputations[agentId].averageRatingPercent}%</p>
                                        </div>
                                        <div>
                                          <p className="text-foreground/60">Completed</p>
                                          <p className="font-bold text-brand-purple">{agentReputations[agentId].completedTasks}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div>
                                    <Label htmlFor={`rating-${agentId}`} className="text-xs">Rating (0-100)</Label>
                                    <div className="flex items-center gap-3 mt-1">
                                      <Input
                                        id={`rating-${agentId}`}
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="85"
                                        value={judgeFeedback[agentId]?.rating || ''}
                                        onChange={(e) => {
                                          const rating = Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                                          setJudgeFeedback(prev => ({
                                            ...prev,
                                            [agentId]: { ...prev[agentId], rating, comment: prev[agentId]?.comment || '' }
                                          }))
                                        }}
                                        className="w-24 text-sm"
                                        disabled={currentFeedbackJudgeId === agentId}
                                      />
                                      <div className="flex-1">
                                        <input
                                          type="range"
                                          min="0"
                                          max="100"
                                          value={judgeFeedback[agentId]?.rating || 0}
                                          onChange={(e) => {
                                            const rating = parseInt(e.target.value)
                                            setJudgeFeedback(prev => ({
                                              ...prev,
                                              [agentId]: { ...prev[agentId], rating, comment: prev[agentId]?.comment || '' }
                                            }))
                                          }}
                                          className="w-full"
                                          disabled={currentFeedbackJudgeId === agentId}
                                        />
                                        <div className="flex justify-between text-xs text-foreground/60 mt-1">
                                          <span>Poor</span>
                                          <span>Excellent</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor={`comment-${agentId}`} className="text-xs">Comment</Label>
                                    <Textarea
                                      id={`comment-${agentId}`}
                                      placeholder="Share your experience with this judge..."
                                      value={judgeFeedback[agentId]?.comment || ''}
                                      onChange={(e) => setJudgeFeedback(prev => ({
                                        ...prev,
                                        [agentId]: { ...prev[agentId], comment: e.target.value }
                                      }))}
                                      className="mt-1.5 min-h-[80px] text-sm"
                                      disabled={currentFeedbackJudgeId === agentId}
                                    />
                                  </div>

                                  {/* Transaction Status */}
                                  {currentFeedbackJudgeId === agentId && (isFeedbackPending || isFeedbackConfirming) && (
                                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                      <div className="flex items-center gap-2 text-sm">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                                        <span className="text-blue-400">
                                          {isFeedbackPending ? "Waiting for wallet confirmation..." : "Transaction confirming on-chain..."}
                                        </span>
                                      </div>
                                      {feedbackHash && (
                                        <p className="text-xs text-foreground/60 mt-2">
                                          TX: <span className="font-mono">{feedbackHash}</span>
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex flex-col gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleSubmitFeedback(agentId)}
                                      disabled={!judgeFeedback[agentId]?.rating || currentFeedbackJudgeId === agentId}
                                      className="bg-brand-purple hover:bg-brand-purple/90"
                                    >
                                      {currentFeedbackJudgeId === agentId
                                        ? (isFeedbackPending ? 'Confirm in Wallet...' : 'Submitting...')
                                        : 'Submit On-Chain Feedback'}
                                    </Button>
                                    {!isConnected && (
                                      <p className="text-xs text-amber-500">⚠️ Connect wallet to submit feedback</p>
                                    )}
                                    {feedbackWriteError && (
                                      <p className="text-xs text-red-500">❌ Error: {feedbackWriteError.message}</p>
                                    )}
                                  </div>

                                  <div className="text-xs text-foreground/60 bg-surface-2/50 p-3 rounded border border-border/30">
                                    <strong className="text-brand-purple">ℹ️ On-Chain Feedback:</strong> Your feedback will be permanently recorded on the Hedera blockchain
                                    via the Reputation Registry smart contract at <code className="text-brand-cyan">{CONTRACT_ADDRESSES.ReputationRegistry}</code>.
                                    This requires a wallet signature and gas fees.
                                  </div>
                                </div>
                              )}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 rounded-lg bg-brand-cyan/5 border border-brand-cyan/20">
                <p className="text-sm text-foreground/70">
                  <strong>Note:</strong> This is a test evaluation to help you understand how your judge system will work. You can skip this step and proceed to create your system.
                </p>
              </div>
            </div>
          )}

          {!loadingJudges && !judgesError && currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Review & Fund System</h2>
                <p className="text-foreground/70">Review configuration and fund your orchestrator</p>
              </div>

              {/* System Info */}
              <div>
                <h3 className="font-semibold mb-3">System Information</h3>
                <div className="p-4 rounded-lg bg-surface-2 border border-border/50 space-y-2">
                  <div>
                    <span className="text-sm text-foreground/60">Name:</span>
                    <h4 className="font-medium">{formData.systemName}</h4>
                  </div>
                  {formData.description && (
                    <div>
                      <span className="text-sm text-foreground/60">Description:</span>
                      <p className="text-sm text-foreground/70">{formData.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Judges */}
              <div>
                <h3 className="font-semibold mb-3">Selected Judges ({selectedJudges.length})</h3>
                <div className="space-y-2">
                  {selectedJudges.map((judge) => (
                    <div
                      key={judge.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={judge.avatar || `/placeholder.svg?height=40&width=40&query=${judge.name}`}
                          alt={judge.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{judge.name}</span>
                      </div>
                      <span className="font-mono font-bold text-brand-gold">${judge.price} / judgment</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Criteria Summary */}
              <div>
                <h3 className="font-semibold mb-3">Evaluation Criteria</h3>
                <div className="p-4 rounded-lg bg-surface-2 border border-border/50">
                  <p className="text-sm text-foreground/70 whitespace-pre-wrap">{formData.criteria}</p>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="p-6 rounded-lg bg-linear-to-br from-brand-purple/10 to-brand-cyan/10 border border-brand-purple/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">Cost Per Evaluation</span>
                  <span className="text-3xl font-mono font-bold text-brand-gold">${totalCost.toFixed(3)}</span>
                </div>
                <p className="text-sm text-foreground/60">
                  Each evaluation will cost ${totalCost.toFixed(3)} using {selectedJudges.length} judges
                </p>
              </div>

              {/* Budget and Owner Address */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="budget">Budget (HBAR) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.001"
                    min={totalCost}
                    placeholder={`Minimum: ${totalCost.toFixed(3)} HBAR`}
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-foreground/60 mt-2">
                    Fund the orchestrator to enable evaluations. Minimum: ${totalCost.toFixed(3)} ({Math.floor(parseFloat(formData.budget || "0") / totalCost)} evaluations)
                  </p>
                </div>

                <div>
                  <Label htmlFor="ownerAddress">Owner Address *</Label>
                  <div className="relative">
                    <Input
                      id="ownerAddress"
                      placeholder={isLoadingHederaAccount ? "Deriving Hedera account..." : "0.0.xxxxx (Hedera Account ID)"}
                      value={formData.ownerAddress}
                      onChange={(e) => setFormData({ ...formData, ownerAddress: e.target.value })}
                      className="mt-1.5"
                      disabled={isLoadingHederaAccount}
                    />
                    {isLoadingHederaAccount && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-cyan"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-foreground/60 mt-2">
                    {isConnected ? 
                      "Automatically derived from your connected wallet address" : 
                      "The Hedera account that will own and control this orchestrator"
                    }
                  </p>
                  {isConnected && address && (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-brand-cyan">
                        EVM Address: {address}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => deriveHederaAccount(address)}
                        disabled={isLoadingHederaAccount}
                        className="text-xs h-6 px-2"
                      >
                        {isLoadingHederaAccount ? "Deriving..." : "Refresh"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Orchestrator Creation Result */}
              {aaWalletInfo && !fundingTxHash && (
                <div className="p-6 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <h4 className="font-medium mb-4 text-blue-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Orchestrator Created Successfully!
                  </h4>

                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-foreground/60">Orchestrator ID</p>
                        <p className="font-mono text-foreground">{aaWalletInfo.orchestratorId}</p>
                      </div>
                      <div>
                        <p className="text-foreground/60">Backend Account ID</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-foreground">0.0.7125500</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText('0.0.7125500')}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <h5 className="font-medium text-amber-400 mb-2">Next Step: Fund Your Orchestrator</h5>
                    <p className="text-sm text-foreground/70 mb-4">
                      Your orchestrator needs HBAR to run evaluations. Please fund the backend account with at least {totalCost.toFixed(3)} HBAR.
                    </p>
                    
                    {/* Transaction Status */}
                    {(isWritePending || isConfirming) && (
                      <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                          <span className="text-blue-400">
                            {isWritePending ? "Waiting for wallet confirmation..." : "Transaction confirming..."}
                          </span>
                        </div>
                        {hash && (
                          <p className="text-xs text-foreground/60 mt-1">
                            Transaction: <span className="font-mono">{hash}</span>
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleFundWallet}
                        disabled={isTransferring || isWritePending || isConfirming || isFundingWallet}
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        {isTransferring ? "Processing Hedera Transfer..." :
                         isWritePending ? "Confirm in Wallet..." : 
                         isConfirming ? "Confirming Transaction..." :
                         isFundingWallet ? "Processing..." : 
                         `Fund with ${formData.budget} HBAR`}
                      </Button>
                      
                      <div className="text-xs text-foreground/60">
                        <p>
                          {isWritePending ? "Please approve the transaction in your wallet" :
                           isConfirming ? "Transaction is being confirmed on Hedera..." :
                           "This will open your wallet to approve the transaction"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Funding Success */}
              {fundingTxHash && (
                <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/30">
                  <h4 className="font-medium mb-2 text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Wallet Funded Successfully!
                  </h4>
                  <div className="space-y-2 text-sm text-foreground/70">
                    <p><strong>Transaction Hash:</strong> <span className="font-mono">{fundingTxHash}</span></p>
                    <p><strong>Amount:</strong> {formData.budget} HBAR</p>
                    {hashscanUrl && (
                      <div className="flex items-center gap-2">
                        <span><strong>View on Hashscan:</strong></span>
                        <a 
                          href={hashscanUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open Transaction
                        </a>
                      </div>
                    )}
                    <p className="text-green-400">Redirecting to orchestrator page...</p>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-brand-cyan/5 border border-brand-cyan/20">
                <h4 className="font-medium mb-2 text-brand-cyan flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  What happens next?
                </h4>
                <ul className="space-y-1 text-sm text-foreground/70">
                  <li>✓ Orchestrator system will be initialized on Hedera</li>
                  <li>✓ HCS topic will be set up for multi-agent communication</li>
                  <li>✓ You'll fund the backend account to enable evaluations</li>
                  <li>✓ Backend will manage the orchestrator using its private key</li>
                  <li>✓ You can submit content for evaluation anytime via API or web interface</li>
                  <li>✓ Each evaluation will use your configured judges and criteria</li>
                </ul>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBack} className="gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? "Back to Marketplace" : "Back"}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isCreatingOrchestrator || aaWalletInfo}
            className="bg-brand-purple hover:bg-brand-purple/90 gap-2"
          >
            {isCreatingOrchestrator ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Creating Orchestrator...
              </>
            ) : aaWalletInfo ? (
              <>
                Orchestrator Created
                <CheckCircle2 className="w-4 h-4" />
              </>
            ) : currentStep === 4 ? (
              <>
                Create Orchestrator
                <ArrowRight className="w-4 h-4" />
              </>
            ) : currentStep === 3 ? (
              <>
                Skip Test & Continue
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
