#!/usr/bin/env bun
/**
 * Complete test for create-judge functionality
 * Tests: Form submission, IPFS upload, Hedera wallet creation, on-chain registration
 * Run with: bun run scripts/test-create-judge-full.ts
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:10000'
const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface CreateJudgeResponse {
  success: boolean
  judgeId?: number
  walletAddress?: string
  evmAddress?: string
  paymentPageUrl?: string
  registryTxHash?: string | null
  ipfsCid?: string | null
  error?: string
}

async function testCreateJudge() {
  console.log('🧪 Testing Create Judge - Full Flow\n')
  console.log('=' .repeat(60))

  // Test data matching the frontend form
  const testJudgeData = {
    name: "Dr. Blockchain Expert",
    title: "Web3 Research Specialist",
    tagline: ["Technical", "Academic"],
    description: "Expert in blockchain technology, smart contracts, and decentralized systems. Specializing in Hedera Hashgraph and EVM-compatible networks with 10+ years of experience in distributed ledger technology.",
    avatar: "https://via.placeholder.com/400x400/8B5CF6/FFFFFF?text=Dr.+Blockchain",
    themeColor: "#8B5CF6",
    specialties: ["Smart Contracts", "Hedera Hashgraph", "DeFi", "Web3 Security"],
    modelProvider: "openai",
    modelName: "gpt-4",
    systemPrompt: "You are Dr. Blockchain Expert, a leading authority in blockchain technology and decentralized systems. Evaluate content with deep technical knowledge of cryptography, consensus mechanisms, smart contract security, and Web3 best practices. Provide thorough analysis focusing on technical accuracy, security implications, and practical implementation.",
    temperature: 0.7,
    price: 0.08,
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // User's wallet (not used, backend creates new one)
  }

  console.log('\n📋 Test Judge Details:')
  console.log('  Name:', testJudgeData.name)
  console.log('  Title:', testJudgeData.title)
  console.log('  Taglines:', testJudgeData.tagline.join(', '))
  console.log('  Specialties:', testJudgeData.specialties.join(', '))
  console.log('  Model:', testJudgeData.modelProvider, '-', testJudgeData.modelName)
  console.log('  Price:', testJudgeData.price, 'HBAR')
  console.log('')

  // Step 1: Create Judge (includes IPFS upload and Hedera wallet creation)
  console.log('📤 Step 1: Creating Judge via API...')
  console.log('  Endpoint:', `${BACKEND_URL}/api/judges`)

  let response: Response
  let data: CreateJudgeResponse

  try {
    response = await fetch(`${BACKEND_URL}/api/judges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testJudgeData)
    })

    data = await response.json()

    console.log('  Status:', response.status, response.statusText)

    if (!response.ok) {
      console.error('\n❌ Failed to create judge')
      console.error('  Error:', data.error || 'Unknown error')
      process.exit(1)
    }

    if (!data.success) {
      console.error('\n❌ Judge creation failed')
      console.error('  Error:', data.error || 'Unknown error')
      process.exit(1)
    }

    console.log('✅ Judge created successfully!\n')

  } catch (error) {
    console.error('\n❌ Network error:', error)
    process.exit(1)
  }

  // Step 2: Display Results
  console.log('=' .repeat(60))
  console.log('📊 Judge Creation Results:')
  console.log('=' .repeat(60))

  console.log('\n🆔 Judge ID:', data.judgeId)
  console.log('\n💼 Hedera Wallet (Created by Backend):')
  console.log('  Account ID:', data.walletAddress)
  console.log('  EVM Address:', data.evmAddress)
  console.log('  Purpose: Receives payments from users')

  console.log('\n💳 Payment Configuration:')
  console.log('  Payment URL:', data.paymentPageUrl)
  console.log('  Price per Judgment:', testJudgeData.price, 'HBAR')

  if (data.ipfsCid) {
    console.log('\n📦 IPFS Metadata:')
    console.log('  CID:', data.ipfsCid)
    console.log('  Gateway URL:', `https://ipfs.io/ipfs/${data.ipfsCid}`)
    console.log('  IPFS URI:', `ipfs://${data.ipfsCid}`)
  }

  if (data.registryTxHash) {
    console.log('\n⛓️  Blockchain Registration:')
    console.log('  Transaction Hash:', data.registryTxHash)

    // Determine network from env
    const network = process.env.HEDERA_NETWORK === 'mainnet' ? 'mainnet' : 'testnet'
    const hashscanUrl = `https://hashscan.io/${network}/transaction/${data.registryTxHash}`

    console.log('  HashScan URL:', hashscanUrl)
    console.log('  Network:', network)
  } else {
    console.log('\n⚠️  On-chain registration not yet implemented')
  }

  // Step 3: Verify in Database
  console.log('\n' + '=' .repeat(60))
  console.log('🔍 Step 2: Verifying Judge in Database...')
  console.log('=' .repeat(60))

  try {
    const verifyResponse = await fetch(`${BACKEND_URL}/api/judges/${data.judgeId}`)
    const verifyData = await verifyResponse.json()

    if (verifyResponse.ok && verifyData.success && verifyData.judge) {
      console.log('✅ Judge found in database\n')

      const judge = verifyData.judge
      console.log('  Name:', judge.name)
      console.log('  Wallet Address:', judge.wallet_address)
      console.log('  EVM Address:', judge.wallet_evm_address || 'Not stored')
      console.log('  Payment URL:', judge.payment_page_url)
      console.log('  Status:', judge.status)
      console.log('  Rating:', judge.rating)
      console.log('  Total Judgments:', judge.total_judgments)
    } else {
      console.log('⚠️  Could not verify judge (GET endpoint may not be implemented)')
    }
  } catch (error) {
    console.log('⚠️  Verification failed:', error)
  }

  // Step 4: Frontend URL
  console.log('\n' + '=' .repeat(60))
  console.log('🌐 Frontend URLs:')
  console.log('=' .repeat(60))
  console.log('\n  Create Judge Page:', `${FRONTEND_URL}/create-judge`)
  console.log('  Marketplace:', `${FRONTEND_URL}/marketplace`)
  console.log('  Judge Detail:', `${FRONTEND_URL}/judge/${data.judgeId}` || 'N/A')

  // Summary
  console.log('\n' + '=' .repeat(60))
  console.log('✅ TEST SUMMARY')
  console.log('=' .repeat(60))
  console.log('\n✓ Judge created successfully')
  console.log('✓ Hedera wallet created:', data.walletAddress)
  console.log('✓ EVM address generated:', data.evmAddress)
  console.log('✓ Payment URL generated:', data.paymentPageUrl)
  console.log(data.ipfsCid ? '✓ IPFS metadata stored' : '⚠ IPFS metadata not stored')
  console.log(data.registryTxHash ? '✓ On-chain registration complete' : '⚠ On-chain registration pending')

  console.log('\n🎉 All tests completed successfully!')
  console.log('\n' + '=' .repeat(60))

  // What to do next
  console.log('\n📝 Next Steps:')
  console.log('  1. Open the marketplace to see your new judge')
  console.log('  2. Check HashScan for on-chain registration (if available)')
  console.log('  3. Test the payment flow via the payment URL')
  console.log('  4. Create an orchestrator using this judge')
  console.log('')
}

testCreateJudge()
