// scripts/fix-donations-564-571.ts
// Fix donations 564-571 that weren't matched due to the bug

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DONATION_IDS = [564, 565, 566, 567, 568, 569, 570, 571]

async function main() {
  console.log('🔍 Checking donations 564-571...\n')

  // Get current state
  const donations = await prisma.donation.findMany({
    where: { id: { in: DONATION_IDS } },
    select: {
      id: true,
      projectSlug: true,
      valueAtDonationTimeUSD: true,
      success: true,
      processed: true,
      status: true,
    },
    orderBy: { id: 'asc' },
  })

  console.log('Current state:')
  let totalUSD = 0
  donations.forEach((d) => {
    totalUSD += Number(d.valueAtDonationTimeUSD)
    console.log(
      `  ID: ${d.id} | ${d.projectSlug} | $${d.valueAtDonationTimeUSD} | success=${d.success} | processed=${d.processed}`
    )
  })
  console.log(`\n  Total: $${totalUSD.toFixed(2)}`)

  // Check for existing matching logs
  const existingLogs = await prisma.matchingDonationLog.findMany({
    where: { donationId: { in: DONATION_IDS } },
  })

  if (existingLogs.length > 0) {
    console.log(
      `\n⚠️  Found ${existingLogs.length} existing matching log entries`
    )
    existingLogs.forEach((log) => {
      console.log(
        `  DonationID: ${log.donationId} | Matched: $${log.matchedAmount}`
      )
    })
  } else {
    console.log('\n❌ No matching log entries found for these donations')
  }

  // Check for --confirm flag
  const shouldFix = process.argv.includes('--confirm')

  if (!shouldFix) {
    console.log('\n📋 To fix these donations, run with --confirm flag:')
    console.log('   npx ts-node scripts/fix-donations-564-571.ts --confirm')
    console.log('\nThis will:')
    console.log('   1. Set success = true')
    console.log('   2. Set processed = false (to allow re-matching)')
    return
  }

  console.log('\n🔄 Fixing donations...')

  const result = await prisma.donation.updateMany({
    where: { id: { in: DONATION_IDS } },
    data: {
      success: true,
      processed: false,
    },
  })

  console.log(`\n✅ Updated ${result.count} donations:`)
  console.log('   - success = true')
  console.log('   - processed = false')

  console.log('\n🚀 Next steps:')
  console.log(
    '   1. Deploy the matching fix to production (if not already done)'
  )
  console.log('   2. Trigger matching via: POST /api/process-matching')
  console.log('   Or wait for the next donation webhook to trigger it')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
