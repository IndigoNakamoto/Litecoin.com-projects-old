import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
  // Get donations 564-571
  const donations = await prisma.donation.findMany({
    where: { id: { gte: 564, lte: 571 } },
    select: {
      id: true,
      projectSlug: true,
      valueAtDonationTimeUSD: true,
      success: true,
      processed: true,
      status: true,
      createdAt: true,
    },
    orderBy: { id: 'asc' },
  })

  console.log('=== DONATIONS 564-571 ===\n')
  donations.forEach((d) => {
    console.log(
      `ID: ${d.id} | Project: ${d.projectSlug} | USD: $${
        d.valueAtDonationTimeUSD
      } | Success: ${d.success} | Processed: ${d.processed} | Status: ${
        d.status
      } | Date: ${d.createdAt.toISOString()}`
    )
  })

  // Get matching logs for these donations
  const matchingLogs = await prisma.matchingDonationLog.findMany({
    where: { donationId: { gte: 564, lte: 571 } },
    orderBy: { donationId: 'asc' },
  })

  console.log('\n=== MATCHING LOGS FOR DONATIONS 564-571 ===\n')
  if (matchingLogs.length === 0) {
    console.log('❌ NO MATCHING ENTRIES FOUND for donations 564-571')
  } else {
    matchingLogs.forEach((log) => {
      console.log(
        `DonationID: ${log.donationId} | DonorID: ${log.donorId} | Matched: $${
          log.matchedAmount
        } | Project: ${log.projectSlug} | Date: ${log.date.toISOString()}`
      )
    })
  }

  await prisma.$disconnect()
}

check()
