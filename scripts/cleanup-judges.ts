#!/usr/bin/env bun
/**
 * Script to clean up old/default judges and keep only specific ones
 * Run with: bun run scripts/cleanup-judges.ts
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:10000'

async function cleanupJudges() {
  console.log('🧹 Cleaning up judges database...\n')

  // Fetch all judges
  const response = await fetch(`${BACKEND_URL}/api/judges`)
  const data = await response.json()

  if (!data.success || !data.judges) {
    console.error('❌ Failed to fetch judges')
    process.exit(1)
  }

  const judges = data.judges

  console.log(`Found ${judges.length} total judges\n`)

  // Display all judges
  console.log('📋 Current Judges:')
  console.log('─'.repeat(80))
  judges.forEach((judge: any) => {
    console.log(`ID: ${judge.id.toString().padEnd(4)} | ${judge.name.padEnd(30)} | ${judge.title || 'N/A'}`)
  })
  console.log('─'.repeat(80))

  // IDs to keep (your newly created judges - adjust these IDs as needed)
  const keepIds = [29, 30] // Adjust these to the judges you want to keep

  // IDs to delete (all others)
  const deleteIds = judges
    .map((j: any) => j.id)
    .filter((id: number) => !keepIds.includes(id))

  console.log(`\n✅ Keeping judges: ${keepIds.join(', ')}`)
  console.log(`❌ Will delete judges: ${deleteIds.join(', ')}\n`)

  if (deleteIds.length === 0) {
    console.log('✅ No judges to delete!')
    return
  }

  // Ask for confirmation
  console.log('⚠️  WARNING: This will permanently delete these judges from the database!')
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')

  await new Promise(resolve => setTimeout(resolve, 5000))

  // Delete judges using direct database access
  // Since we don't have a DELETE endpoint, we'll need to use MySQL directly
  console.log('💡 To delete these judges, run this SQL command:\n')

  const sqlCommand = `DELETE FROM judges WHERE id IN (${deleteIds.join(',')});`
  console.log(sqlCommand)
  console.log('')

  console.log('Or run this MySQL command:')
  console.log(`mysql -u root -p jurybox -e "${sqlCommand}"`)
  console.log('')

  console.log('✅ Script complete!')
}

cleanupJudges().catch(console.error)
