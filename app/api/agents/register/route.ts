import { NextRequest, NextResponse } from 'next/server'
import { getViemRegistryService } from '@/lib/erc8004/viem-registry-service'
import { getHederaService } from '@/lib/hedera/agent-service'
import type { AgentMetadata } from '@/lib/ipfs/pinata-service'

/**
 * ERC-8004 compliant agent registration endpoint
 * POST /api/agents/register
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      )
    }

    // Step 1: Create Hedera account for the agent (optional)
    let hederaAccountId = body.hederaAccount
    if (!hederaAccountId) {
      const hederaService = getHederaService()
      const accountInfo = await hederaService.createAgentAccount(10) // 10 HBAR initial balance
      hederaAccountId = accountInfo.accountId
    }

    // Step 2: Prepare ERC-8004 compliant metadata
    const metadata: AgentMetadata & {
      type?: string
      image?: string
      endpoints?: Array<{
        name: string
        endpoint: string
        version?: string
        capabilities?: any
      }>
      registrations?: Array<{
        agentId?: number
        agentRegistry: string
      }>
      supportedTrust?: string[]
    } = {
      // Core ERC-8004 fields
      type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      name: body.name,
      description: body.description,
      image: body.image,

      // Agent capabilities for JuryBox
      capabilities: body.specialties || [],
      hederaAccount: hederaAccountId,
      createdAt: Date.now(),
      version: '1.0.0',

      // ERC-8004 endpoints - A2A for agent-to-agent interaction
      endpoints: [
        {
          name: 'A2A',
          endpoint: `${process.env.NEXT_PUBLIC_APP_URL}/.well-known/agent-card.json`,
          version: '0.3.0',
        },
        {
          name: 'agentWallet',
          // CAIP-10 format: eip155:<chainId>:<address>
          // Hedera testnet chainId is 296
          endpoint: `eip155:296:${hederaAccountId}`,
        },
      ],

      // Will be populated after registration
      registrations: [],

      // Trust mechanisms (for JuryBox)
      supportedTrust: ['reputation', 'crypto-economic'],
    }

    // Step 3: Register agent on-chain via ERC-8004 Identity Registry
    const registryService = getViemRegistryService()
    const result = await registryService.registerAgent(metadata)

    // Step 4: Update registrations field with on-chain ID
    metadata.registrations = [
      {
        agentId: Number(result.agentId),
        agentRegistry: `eip155:296:${process.env.HEDERA_NETWORK || 'testnet'}`, // Hedera chainId 296
      },
    ]

    // Return ERC-8004 compliant response
    return NextResponse.json({
      success: true,
      agent: {
        ...metadata,
        agentId: result.agentId.toString(),
        ipfsUri: result.ipfsUri,
        txHash: result.txHash,
        owner: result.owner,
        modelProvider: body.modelProvider,
        modelName: body.modelName,
        systemPrompt: body.systemPrompt,
        temperature: body.temperature,
        pricePerJudgment: body.pricePerJudgment,
      },
    })
  } catch (error: any) {
    console.error('Agent registration error:', error)
    return NextResponse.json(
      {
        error: 'Failed to register agent',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * Get agent by ID
 * GET /api/agents/register?agentId=123
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const agentId = searchParams.get('agentId')

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId parameter' }, { status: 400 })
    }

    const registryService = getViemRegistryService()
    const metadata = await registryService.getAgentMetadata(BigInt(agentId))

    return NextResponse.json({
      success: true,
      agent: metadata,
    })
  } catch (error: any) {
    console.error('Get agent error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get agent',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
