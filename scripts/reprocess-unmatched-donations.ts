// scripts/reprocess-unmatched-donations.ts
// This script finds donations that were processed but may not have been properly matched
// due to the double-subtraction bug, and resets them for reprocessing.
//
// Only looks at SUCCESSFUL donations that should have been eligible for matching.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Finding successful donations that may need reprocessing...\n')

  // Get all processed, SUCCESSFUL donations with valid amounts
  const processedDonations = await prisma.donation.findMany({
    where: {
      processed: true,
      success: true, // Only successful donations
      valueAtDonationTimeUSD: { gt: 0 },
    },
    select: {
      id: true,
      projectSlug: true,
      valueAtDonationTimeUSD: true,
      createdAt: true,
      status: true,
    },
  })

  console.log(
    `Found ${processedDonations.length} successful, processed donations with valid amounts`
  )

  // Get matching logs for these donations
  const donationIds = processedDonations.map((d) => d.id)
  const matchingLogs = await prisma.matchingDonationLog.groupBy({
    by: ['donationId'],
    where: {
      donationId: { in: donationIds },
    },
    _sum: {
      matchedAmount: true,
    },
  })

  // Create a map of donationId to matched amount
  const matchedMap = new Map<number, number>()
  matchingLogs.forEach((log) => {
    if (log.donationId) {
      matchedMap.set(log.donationId, log._sum.matchedAmount?.toNumber() ?? 0)
    }
  })

  // Find donations with NO matching entries (potentially affected by the bug)
  const unmatchedDonations = processedDonations.filter(
    (d) => !matchedMap.has(d.id) || matchedMap.get(d.id) === 0
  )

  if (unmatchedDonations.length === 0) {
    console.log(
      '\n✅ All successful donations already have matching entries (or none are eligible).'
    )
    return
  }

  // Group by project for summary
  const byProject = unmatchedDonations.reduce((acc, d) => {
    if (!acc[d.projectSlug]) {
      acc[d.projectSlug] = { count: 0, totalUSD: 0 }
    }
    acc[d.projectSlug].count++
    acc[d.projectSlug].totalUSD += Number(d.valueAtDonationTimeUSD)
    return acc
  }, {} as Record<string, { count: number; totalUSD: number }>)

  console.log(
    `\n⚠️  Found ${unmatchedDonations.length} successful donations with NO matching entries:`
  )
  console.log('\n📊 Summary by project:')
  Object.entries(byProject).forEach(([slug, stats]) => {
    console.log(
      `   ${slug}: ${stats.count} donations, $${stats.totalUSD.toFixed(
        2
      )} total`
    )
  })

  console.log('\n📋 Detailed list:')
  unmatchedDonations.forEach((d) => {
    console.log(
      `  - ID: ${d.id}, Project: ${d.projectSlug}, Amount: $${
        d.valueAtDonationTimeUSD
      }, Status: ${d.status || 'N/A'}, Date: ${d.createdAt.toISOString()}`
    )
  })

  // Ask for confirmation via command line argument
  const shouldReprocess = process.argv.includes('--confirm')

  if (!shouldReprocess) {
    console.log('\n📋 To reprocess these donations, run with --confirm flag:')
    console.log(
      '   npx ts-node scripts/reprocess-unmatched-donations.ts --confirm'
    )
    return
  }

  console.log('\n🔄 Resetting processed flag for affected donations...')

  const unmatchedIds = unmatchedDonations.map((d) => d.id)
  const result = await prisma.donation.updateMany({
    where: {
      id: { in: unmatchedIds },
    },
    data: {
      processed: false,
    },
  })

  console.log(`\n✅ Reset ${result.count} donations to processed=false`)
  console.log('\n🚀 Next steps:')
  console.log('   1. Deploy the matching fix to production')
  console.log(
    '   2. Trigger the matching process via POST /api/process-matching'
  )
  console.log('   Or the webhook will process them on the next donation')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
