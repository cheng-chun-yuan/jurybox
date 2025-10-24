#!/usr/bin/env bun
/**
 * Quick health check for JuryBox system
 * Run with: bun run scripts/health-check.ts
 */

console.log('🏥 JuryBox System Health Check')
console.log('═'.repeat(60))

interface HealthCheck {
  component: string
  status: 'ok' | 'warning' | 'error'
  message: string
}

const checks: HealthCheck[] = []

// Check 1: Environment Variables
console.log('\n1️⃣  Checking environment variables...')
const requiredVars = [
  'HEDERA_ACCOUNT_ID',
  'HEDERA_PRIVATE_KEY',
  'HEDERA_NETWORK',
]

const optionalVars = [
  'PINATA_API_KEY',
  'PINATA_API_SECRET',
  'OPENAI_API_KEY',
]

let envStatus: 'ok' | 'warning' = 'ok'
let envMessage = 'All required variables set'

requiredVars.forEach((varName) => {
  const value = process.env[varName]
  if (!value || value.includes('your-') || value.length < 5) {
    envStatus = 'warning'
    envMessage = 'Some required variables missing or using placeholders'
    console.log(`   ⚠️  ${varName}: Not properly configured`)
  } else {
    console.log(`   ✅ ${varName}: Configured`)
  }
})

optionalVars.forEach((varName) => {
  const value = process.env[varName]
  if (!value || value.includes('your-')) {
    console.log(`   ⚠️  ${varName}: Not configured (optional)`)
  } else {
    console.log(`   ✅ ${varName}: Configured`)
  }
})

checks.push({
  component: 'Environment Variables',
  status: envStatus,
  message: envMessage,
})

// Check 2: File Structure
console.log('\n2️⃣  Checking file structure...')
const fs = await import('fs')
const requiredFiles = [
  'lib/hedera/multi-agent-orchestrator.ts',
  'lib/hedera/hcs-communication.ts',
  'lib/hedera/agent-service.ts',
  'lib/erc8004/viem-registry-service.ts',
  'lib/erc8004/viem-client.ts',
  'lib/ipfs/pinata-service.ts',
  'lib/x402/payment-service.ts',
]

let fileStatus: 'ok' | 'error' = 'ok'
let fileMessage = 'All required files present'

for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`)
  } else {
    console.log(`   ❌ ${file}: Missing`)
    fileStatus = 'error'
    fileMessage = 'Some required files are missing'
  }
}

checks.push({
  component: 'File Structure',
  status: fileStatus,
  message: fileMessage,
})

// Check 3: Dependencies
console.log('\n3️⃣  Checking dependencies...')
const requiredDeps = [
  '@hashgraph/sdk',
  'viem',
  'ethers',
  '@langchain/core',
  '@langchain/openai',
]

let depStatus: 'ok' | 'error' = 'ok'
let depMessage = 'All required dependencies installed'

const packageJson = JSON.parse(
  fs.readFileSync('package.json', 'utf-8')
)

for (const dep of requiredDeps) {
  if (packageJson.dependencies[dep]) {
    console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`)
  } else {
    console.log(`   ❌ ${dep}: Not installed`)
    depStatus = 'error'
    depMessage = 'Some required dependencies missing'
  }
}

checks.push({
  component: 'Dependencies',
  status: depStatus,
  message: depMessage,
})

// Check 4: Test Scripts
console.log('\n4️⃣  Checking test scripts...')
const testScripts = [
  'scripts/test-pinata.ts',
  'scripts/test-hedera.ts',
  'scripts/test-registry.ts',
  'scripts/test-orchestrator.ts',
]

let scriptStatus: 'ok' | 'warning' = 'ok'
let scriptMessage = 'All test scripts available'

for (const script of testScripts) {
  if (fs.existsSync(script)) {
    console.log(`   ✅ ${script}`)
  } else {
    console.log(`   ⚠️  ${script}: Missing`)
    scriptStatus = 'warning'
    scriptMessage = 'Some test scripts missing'
  }
}

checks.push({
  component: 'Test Scripts',
  status: scriptStatus,
  message: scriptMessage,
})

// Summary
console.log('\n\n📊 Health Check Summary')
console.log('═'.repeat(60))

checks.forEach((check) => {
  const icon =
    check.status === 'ok'
      ? '✅'
      : check.status === 'warning'
        ? '⚠️ '
        : '❌'
  console.log(`${icon} ${check.component}: ${check.message}`)
})

const hasErrors = checks.some((c) => c.status === 'error')
const hasWarnings = checks.some((c) => c.status === 'warning')

console.log('\n' + '─'.repeat(60))

if (hasErrors) {
  console.log('❌ CRITICAL: System has errors that must be fixed')
  process.exit(1)
} else if (hasWarnings) {
  console.log('⚠️  WARNING: System functional but incomplete configuration')
  console.log('\nTo enable full functionality:')
  console.log('1. Configure Hedera credentials in .env')
  console.log('2. Add Pinata API keys for real IPFS')
  console.log('3. Add AI model API keys for evaluations')
  console.log('\nSee TEST_RESULTS.md for details')
} else {
  console.log('✅ SUCCESS: All systems operational')
}

console.log('\nFor detailed test results: cat TEST_RESULTS.md')
console.log('To run tests: bun run scripts/test-all.ts')
