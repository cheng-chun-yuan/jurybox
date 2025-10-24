import { NextRequest, NextResponse } from 'next/server'
import { getOrchestrator, type OrchestratorConfig } from '@/lib/hedera/multi-agent-orchestrator'
import { getJudgesByIds } from '@/lib/judges-database'
import type { Agent } from '@/types/agent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { judgeIds, systemName, criteria, budget, ownerAddress } = body

    // Validate required fields
    if (!judgeIds || !Array.isArray(judgeIds) || judgeIds.length === 0) {
      return NextResponse.json(
        { error: 'Judge IDs are required' },
        { status: 400 }
      )
    }

    if (!systemName || !criteria) {
      return NextResponse.json(
        { error: 'System name and criteria are required' },
        { status: 400 }
      )
    }

    if (!budget || budget <= 0) {
      return NextResponse.json(
        { error: 'Valid budget is required' },
        { status: 400 }
      )
    }

    if (!ownerAddress) {
      return NextResponse.json(
        { error: 'Owner address is required' },
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

    // Convert judges to Agent format expected by orchestrator
    const agents: Agent[] = judges.map((judge, index) => ({
      id: `agent-${judge.id}`,
      name: judge.name,
      title: judge.title,
      description: judge.bio,
      status: 'active',
      capabilities: {
        modelProvider: 'openai', // Default, can be customized
        model: 'gpt-4',
        temperature: 0.7,
        specialties: judge.specialties.map(s => s.toLowerCase()),
      },
      hederaAccount: {
        accountId: `0.0.${10000 + index}`, // Mock account ID
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

    // Create orchestrator configuration
    const config: OrchestratorConfig = {
      maxDiscussionRounds: 3,
      roundTimeout: 60000, // 60 seconds
      consensusAlgorithm: 'weighted_average',
      enableDiscussion: agents.length > 1,
      convergenceThreshold: 0.5,
      outlierDetection: true,
    }

    // Get orchestrator instance
    const orchestrator = getOrchestrator()

    // Create orchestrator system ID
    const systemId = `system-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // Calculate total cost
    const totalCost = judges.reduce((sum, judge) => sum + judge.price, 0)

    // Verify budget is sufficient
    if (budget < totalCost) {
      return NextResponse.json(
        {
          error: 'Insufficient budget',
          required: totalCost,
          provided: budget
        },
        { status: 400 }
      )
    }

    // Return orchestrator system details
    // In production, this would:
    // 1. Create HCS topic for communication
    // 2. Fund the orchestrator with budget
    // 3. Set ownership to ownerAddress
    // 4. Store system configuration in database/IPFS

    return NextResponse.json({
      success: true,
      system: {
        id: systemId,
        name: systemName,
        criteria,
        judges: judges.map(j => ({
          id: j.id,
          name: j.name,
          price: j.price,
        })),
        config,
        budget: {
          total: budget,
          costPerEvaluation: totalCost,
          remainingEvaluations: Math.floor(budget / totalCost),
        },
        owner: ownerAddress,
        createdAt: Date.now(),
        status: 'active',
      },
      message: 'Orchestrator system created successfully',
    })

  } catch (error) {
    console.error('Error creating orchestrator:', error)
    return NextResponse.json(
      { error: 'Failed to create orchestrator system' },
      { status: 500 }
    )
  }
}
