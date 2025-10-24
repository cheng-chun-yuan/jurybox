#!/usr/bin/env bun
/**
 * Comprehensive test suite for JuryBox components
 * Run with: bun run scripts/test-all.ts
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface TestResult {
  name: string
  passed: boolean
  duration: number
  error?: string
}

const tests: { name: string; script: string }[] = [
  { name: 'IPFS/Pinata Service', script: 'bun run scripts/test-pinata.ts' },
  { name: 'Hedera Service', script: 'bun run scripts/test-hedera.ts' },
  { name: 'ERC8004 Registry', script: 'bun run scripts/test-registry.ts' },
  { name: 'Multi-Agent Orchestrator', script: 'bun run scripts/test-orchestrator.ts' },
]

async function runTest(test: { name: string; script: string }): Promise<TestResult> {
  const startTime = Date.now()

  try {
    console.log(`\n🧪 Testing: ${test.name}`)
    console.log('━'.repeat(60))

    await execAsync(test.script, { timeout: 60000 })

    const duration = Date.now() - startTime
    console.log(`✅ ${test.name} passed in ${duration}ms`)

    return {
      name: test.name,
      passed: true,
      duration,
    }
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.log(`❌ ${test.name} failed in ${duration}ms`)

    return {
      name: test.name,
      passed: false,
      duration,
      error: error.message,
    }
  }
}

async function runAllTests() {
  console.log('🚀 JuryBox Test Suite')
  console.log('═'.repeat(60))

  const results: TestResult[] = []

  for (const test of tests) {
    const result = await runTest(test)
    results.push(result)
  }

  console.log('\n\n📊 Test Summary')
  console.log('═'.repeat(60))

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌'
    const time = `${result.duration}ms`
    console.log(`${icon} ${result.name.padEnd(30)} ${time}`)
    if (result.error) {
      console.log(`   Error: ${result.error}`)
    }
  })

  console.log('─'.repeat(60))
  console.log(`Total: ${passed}/${results.length} passed`)
  console.log(`Duration: ${totalDuration}ms`)

  if (failed > 0) {
    console.log(`\n⚠️  ${failed} test(s) failed`)
    process.exit(1)
  } else {
    console.log('\n🎉 All tests passed!')
  }
}

runAllTests()
