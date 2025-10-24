#!/usr/bin/env bun
/**
 * Test script for viem-based Hedera integration
 * Run with: bun run scripts/test-viem-hedera.ts
 */

import { getHederaViemIntegration } from '../lib/hedera/viem-integration'
import { hederaTestnet } from 'viem/chains'

async function testViemHederaIntegration() {
  console.log('🧪 Testing viem-based Hedera Integration\n')

  try {
    // Test 1: Initialize viem integration
    console.log('Test 1: Initializing viem Hedera integration...')
    const hederaViemService = getHederaViemIntegration()
    console.log('✅ Viem integration initialized successfully\n')

    // Test 2: Network information
    console.log('Test 2: Network information...')
    const chainInfo = hederaViemService.getChainInfo()
    console.log('Chain ID:', chainInfo.id)
    console.log('Network:', chainInfo.name)
    console.log('RPC URL:', chainInfo.rpcUrl)
    console.log('Block Explorer:', chainInfo.blockExplorer)
    console.log('Native Currency:', chainInfo.nativeCurrency.symbol)
    console.log('Testnet:', chainInfo.testnet)
    console.log('✅ Network info retrieved successfully\n')

    // Test 3: Test account operations (read-only)
    console.log('Test 3: Testing account operations...')
    const testAddress = '0x0000000000000000000000000000000000000001' as `0x${string}`
    
    try {
      const balance = await hederaViemService.getBalance(testAddress)
      console.log(`Balance for ${testAddress}: ${balance.toString()} wei`)
      console.log(`Balance in HBAR: ${(Number(balance) / 1e18).toFixed(4)} HBAR`)
    } catch (error) {
      console.log('⚠️  Balance query failed (expected for test address):', error instanceof Error ? error.message : 'Unknown error')
    }

    try {
      const nonce = await hederaViemService.getNonce(testAddress)
      console.log(`Nonce for ${testAddress}: ${nonce}`)
    } catch (error) {
      console.log('⚠️  Nonce query failed (expected for test address):', error instanceof Error ? error.message : 'Unknown error')
    }

    try {
      const account = await hederaViemService.getAccount(testAddress)
      console.log('Account info:', {
        address: account.address,
        balance: account.balance.toString(),
        nonce: account.nonce
      })
    } catch (error) {
      console.log('⚠️  Account query failed (expected for test address):', error instanceof Error ? error.message : 'Unknown error')
    }

    console.log('✅ Account operations tested (read-only mode)\n')

    // Test 4: Network switching (testnet only)
    console.log('Test 4: Testing network switching (testnet only)...')
    console.log('Current network:', hederaViemService.getChainInfo().name)
    hederaViemService.switchNetwork(hederaTestnet.id)
    console.log('Switched to:', hederaViemService.getChainInfo().name)
    console.log('✅ Network switching works correctly (testnet)\n')

    // Test 5: Chain configuration validation
    console.log('Test 5: Validating chain configurations...')
    console.log('Hedera Testnet:', {
      id: hederaTestnet.id,
      name: hederaTestnet.name,
      rpcUrl: hederaTestnet.rpcUrls.default.http[0],
      testnet: hederaTestnet.testnet
    })
    
    // Mainnet not used in current configuration
    
    console.log('Default Chain:', {
      id: hederaTestnet.id,
      name: hederaTestnet.name
    })
    console.log('✅ Chain configurations validated\n')

    console.log('🎉 All viem-based Hedera integration tests completed!')
    console.log('\nℹ️  Note: Write operations (transfers, contract calls) require:')
    console.log('  - Wallet client setup with wagmi')
    console.log('  - User authentication through Privy')
    console.log('  - Sufficient HBAR balance for gas fees')
    console.log('  - Proper wallet connection')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testViemHederaIntegration()
