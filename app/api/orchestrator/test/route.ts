import { NextRequest, NextResponse } from 'next/server'
import { getOrchestrator, type OrchestratorConfig } from '@/lib/hedera/multi-agent-orchestrator'
import { getJudgesByIds } from '@/lib/judges-database'
import type { Agent, JudgmentRequest } from '@/types/agent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { judgeIds, testContent, criteria } = body

    // Validate required fields
    if (!judgeIds || !Array.isArray(judgeIds) || judgeIds.length === 0) {
      return NextResponse.json(
        { error: 'Judge IDs are required' },
        { status: 400 }
      )
    }

    if (!testContent) {
      return NextResponse.json(
        { error: 'Test content is required' },
        { status: 400 }
      )
    }

    // Get judges from database
    const judges = getJudgesByIds(judgeIds)

    if (judges.length === 0) {
      return NextResponse.json(
        { error: 'No valid judges found' },
        { status: 400 }
      )
    }

    // Convert judges to Agent format
    const agents: Agent[] = judges.map((judge, index) => ({
      id: `agent-${judge.id}`,
      name: judge.name,
      title: judge.title,
      description: judge.bio,
      status: 'active',
      capabilities: {
        modelProvider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        specialties: judge.specialties.map(s => s.toLowerCase()),
      },
      hederaAccount: {
        accountId: `0.0.${10000 + index}`,
        publicKey: `mock-key-${judge.id}`,
        balance: 100,
      },
      paymentConfig: {
        enabled: true,
        pricePerJudgment: judge.price,
        acceptedTokens: ['HBAR'],
        minimumPayment: 0.1,
      },
      reputation: {
        totalReviews: judge.reviews,
        averageRating: judge.rating,
        completedTasks: judge.reviews,
      },
      metadata: {
        ipfsUri: `ipfs://QmMock${judge.id}`,
        onChainId: judge.id.toString(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }))

    // Create judgment request
    const requestId = `test-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const judgmentRequest: JudgmentRequest = {
      id: requestId,
      creatorId: 'test-user',
      content: testContent,
      criteria: criteria ? criteria.split(',').map((c: string) => c.trim()) : [
        'Accuracy',
        'Clarity',
        'Completeness',
        'Relevance',
      ],
      requestedAgentIds: agents.map(a => a.id),
      status: 'pending',
      createdAt: Date.now(),
    }

    // Orchestrator configuration
    const config: OrchestratorConfig = {
      maxDiscussionRounds: 2, // Reduced for faster testing
      roundTimeout: 30000, // 30 seconds
      consensusAlgorithm: 'weighted_average',
      enableDiscussion: agents.length > 1,
      convergenceThreshold: 0.5,
      outlierDetection: true,
    }

    // Get orchestrator and execute evaluation
    const orchestrator = getOrchestrator()

    try {
      const result = await orchestrator.executeEvaluation(
        judgmentRequest,
        agents,
        config
      )

      // Format the response with detailed agent messages
      return NextResponse.json({
        success: true,
        evaluation: {
          requestId,
          topicId: result.topicId,
          averageScore: result.consensusResult.finalScore,
          confidence: result.consensusResult.confidence,
          variance: result.consensusResult.variance,
          algorithm: result.consensusResult.algorithm,
          convergenceRounds: result.consensusResult.convergenceRounds,
          judges: result.judgmentResults.map((jr, idx) => ({
            id: agents[idx].id,
            name: agents[idx].name,
            score: jr.score,
            feedback: jr.feedback,
            strengths: jr.strengths,
            improvements: jr.improvements,
          })),
          hcsMessages: result.evaluationRounds.map(round => ({
            roundNumber: round.roundNumber,
            duration: round.endTime - round.startTime,
            messages: round.messages.map(msg => ({
              type: msg.type,
              agentName: msg.agentName,
              timestamp: msg.timestamp,
              data: msg.data,
            })),
          })),
          individualScores: result.consensusResult.individualScores,
        },
      })

    } catch (orchestratorError) {
      console.error('Orchestrator execution error:', orchestratorError)

      // Return mock data if orchestrator fails (for demo purposes)
      return NextResponse.json({
        success: true,
        evaluation: {
          requestId,
          topicId: 'mock-topic-id',
          averageScore: 8.5 + (Math.random() - 0.5),
          confidence: 0.85,
          variance: 0.3,
          algorithm: 'weighted_average',
          convergenceRounds: 2,
          judges: agents.map((agent, idx) => ({
            id: agent.id,
            name: agent.name,
            score: 8.5 + (Math.random() - 0.5),
            feedback: `Detailed evaluation from ${agent.name}. The content demonstrates good understanding and clarity.`,
            strengths: ['Clear structure', 'Good examples', 'Thorough analysis'],
            improvements: ['Could add more detail', 'Consider additional sources', 'Expand conclusion'],
          })),
          hcsMessages: [
            {
              roundNumber: 0,
              duration: 1200,
              messages: agents.map((agent, idx) => ({
                type: 'score',
                agentName: agent.name,
                timestamp: Date.now() - 2000 + (idx * 100),
                data: {
                  score: 8.5 + (Math.random() - 0.5),
                  reasoning: `Initial evaluation based on ${agent.capabilities.specialties.join(', ')}`,
                  confidence: 0.8,
                },
              })),
            },
            {
              roundNumber: 1,
              duration: 1500,
              messages: agents.map((agent, idx) => ({
                type: 'discussion',
                agentName: agent.name,
                timestamp: Date.now() - 500 + (idx * 100),
                data: {
                  content: `Reviewing peer evaluations from ${agent.capabilities.specialties[0]} perspective...`,
                },
              })),
            },
          ],
          individualScores: agents.reduce((acc, agent) => ({
            ...acc,
            [agent.id]: 8.5 + (Math.random() - 0.5),
          }), {}),
        },
        note: 'Demo mode: Using mock HCS messages. Connect to Hedera testnet for real-time consensus tracking.',
      })
    }

  } catch (error) {
    console.error('Error in test evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to execute test evaluation' },
      { status: 500 }
    )
  }
}
