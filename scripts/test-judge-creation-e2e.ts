#!/usr/bin/env bun
/**
 * End-to-end test for judge creation with visual output
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:10000'

async function testE2E() {
  console.log('\n' + '='.repeat(70))
  console.log('🧪 END-TO-END JUDGE CREATION TEST')
  console.log('='.repeat(70))

  const judgeData = {
    name: "Dr. E2E Test",
    title: "Integration Test Specialist",
    tagline: ["Technical"],
    description: "Testing complete judge creation flow with IPFS and blockchain registration",
    avatar: "https://via.placeholder.com/300",
    themeColor: "#8B5CF6",
    specialties: ["Testing", "E2E", "Integration"],
    modelProvider: "openai",
    modelName: "gpt-4",
    systemPrompt: "You are a test judge for E2E testing.",
    temperature: 0.7,
    price: 0.05,
  }

  console.log('\n📤 Creating judge...')

  try {
    const response = await fetch(`${BACKEND_URL}/api/judges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(judgeData)
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      console.error('\n❌ Failed to create judge')
      console.error(data)
      process.exit(1)
    }

    console.log('✅ Judge created successfully!\n')

    // Display the success card simulation
    console.log('='.repeat(70))
    console.log('📊 FRONTEND WILL DISPLAY:')
    console.log('='.repeat(70))

    console.log('\n┌─────────────────────────────────────────────────────────────┐')
    console.log('│  ✅ Judge Registered Successfully!                         │')
    console.log('└─────────────────────────────────────────────────────────────┘')

    console.log('\n📋 Judge ID')
    console.log(`   ${data.judgeId}`)

    console.log('\n💼 Hedera Wallet')
    console.log(`   Account ID: ${data.walletAddress || 'N/A'}`)
    console.log(`   EVM Address: ${data.evmAddress || 'N/A'}`)

    if (data.ipfsCid && data.ipfsCid !== 'N/A') {
      console.log('\n📦 IPFS Metadata')
      console.log(`   CID: ${data.ipfsCid}`)
      console.log('   🔗 View on IPFS Gateway')
      console.log(`   → https://ipfs.io/ipfs/${data.ipfsCid}`)
    }

    if (data.registryTxHash && data.registryTxHash !== 'N/A' && data.registryTxHash !== null) {
      console.log('\n⛓️  Blockchain Registration')
      console.log(`   TX: ${data.registryTxHash}`)
      console.log('   🔗 View on HashScan (Testnet)')
      console.log(`   → https://hashscan.io/testnet/transaction/${data.registryTxHash}`)
    } else {
      console.log('\n⚠️  Blockchain registration pending (not yet implemented)')
    }

    console.log('\n💳 Payment Page URL')
    console.log(`   🔗 ${data.paymentPageUrl}`)

    console.log('\n┌─────────────────────────────────────────────────────────────┐')
    console.log('│  [Go to Marketplace]      [Create Another Judge]           │')
    console.log('└─────────────────────────────────────────────────────────────┘')

    console.log('\n' + '='.repeat(70))
    console.log('✅ TEST RESULTS:')
    console.log('='.repeat(70))

    const checks = [
      { name: 'Judge Created', status: !!data.judgeId, value: data.judgeId },
      { name: 'Hedera Wallet Created', status: !!data.walletAddress, value: data.walletAddress },
      { name: 'EVM Address Generated', status: !!data.evmAddress, value: data.evmAddress },
      { name: 'Payment URL Generated', status: !!data.paymentPageUrl, value: data.paymentPageUrl },
      { name: 'IPFS Metadata', status: !!data.ipfsCid && data.ipfsCid !== 'N/A', value: data.ipfsCid || 'Not uploaded' },
      { name: 'On-chain Registration', status: !!data.registryTxHash && data.registryTxHash !== 'N/A', value: data.registryTxHash || 'Pending' },
    ]

    checks.forEach(check => {
      const icon = check.status ? '✅' : '⚠️ '
      console.log(`\n${icon} ${check.name}`)
      console.log(`   ${check.value}`)
    })

    console.log('\n' + '='.repeat(70))
    console.log('🎯 NEXT STEPS FOR COMPLETE IMPLEMENTATION:')
    console.log('='.repeat(70))

    const todos = []
    if (!data.ipfsCid || data.ipfsCid === 'N/A') {
      todos.push('📦 Implement IPFS metadata upload in backend')
    }
    if (!data.registryTxHash || data.registryTxHash === 'N/A') {
      todos.push('⛓️  Implement on-chain registration in backend')
    }

    if (todos.length > 0) {
      console.log('\nTODO:')
      todos.forEach(todo => console.log(`  ${todo}`))
    } else {
      console.log('\n🎉 All features implemented!')
    }

    console.log('\n' + '='.repeat(70))
    console.log('✅ E2E TEST COMPLETE!')
    console.log('='.repeat(70))
    console.log('')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

testE2E()
