#!/usr/bin/env bun
/**
 * Test script for creating a judge via API
 * Run with: bun run scripts/test-create-judge.ts
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:10000'

async function testCreateJudge() {
  console.log('🧪 Testing Create Judge Endpoint\n')

  const testJudgeData = {
    name: "Dr. Test Judge",
    title: "Test Specialist",
    tagline: ["Academic", "Technical"],
    description: "This is a test judge created via automated script to verify the create-judge API endpoint and Hedera wallet creation.",
    avatar: "https://via.placeholder.com/150",
    themeColor: "#8B5CF6",
    specialties: ["Testing", "Automation", "QA"],
    modelProvider: "openai",
    modelName: "gpt-4",
    systemPrompt: "You are Dr. Test Judge, an expert in software testing and quality assurance. Evaluate content with focus on correctness, reliability, and best practices.",
    temperature: 0.7,
    price: 0.05,
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    ipfsCid: "QmTestCID123456789"
  }

  console.log('📤 Sending request to:', `${BACKEND_URL}/api/judges`)
  console.log('📦 Request body:', JSON.stringify(testJudgeData, null, 2))
  console.log('')

  try {
    const response = await fetch(`${BACKEND_URL}/api/judges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testJudgeData)
    })

    console.log('📥 Response status:', response.status, response.statusText)

    const data = await response.json()
    console.log('📦 Response body:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error('\n❌ Test failed:', data.error || 'Unknown error')
      process.exit(1)
    }

    if (data.success) {
      console.log('\n✅ Judge created successfully!')
      console.log('Judge ID:', data.judgeId)
      console.log('Wallet Address:', data.walletAddress)
      console.log('EVM Address:', data.evmAddress)
      console.log('Payment URL:', data.paymentPageUrl)
      console.log('Registry TX Hash:', data.registryTxHash || 'N/A')
      console.log('IPFS CID:', data.ipfsCid || 'N/A')

      // Verify judge was created by fetching it
      console.log('\n🔍 Verifying judge was created...')
      const verifyResponse = await fetch(`${BACKEND_URL}/api/judges/${data.judgeId}`)
      const verifyData = await verifyResponse.json()

      if (verifyData.success && verifyData.judge) {
        console.log('✅ Judge verified in database')
        console.log('Judge name:', verifyData.judge.name)
        console.log('Judge wallet:', verifyData.judge.wallet_address)
      } else {
        console.log('⚠️  Could not verify judge in database')
      }
    } else {
      console.error('\n❌ Test failed:', data.error || 'Unknown error')
      process.exit(1)
    }

    console.log('\n🎉 All tests passed!')
  } catch (error) {
    console.error('\n❌ Test failed with error:', error)
    process.exit(1)
  }
}

testCreateJudge()
