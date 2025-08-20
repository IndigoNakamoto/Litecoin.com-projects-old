// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Type representing a processed donation with conditional fields.
 */
export interface ProcessedDonation {
  isAnonymous: boolean
  firstName?: string | null
  lastName?: string | null
  socialX?: string | null
  socialFacebook?: string | null
  socialLinkedIn?: string | null
}

/**
 * Transforms a donation by excluding firstName and lastName if isAnonymous is true.
 *
 * @param {ProcessedDonation} donation - The donation to transform.
 * @returns {ProcessedDonation} - The transformed donation.
 */
export const transformDonation = (
  donation: ProcessedDonation
): ProcessedDonation => {
  if (donation.isAnonymous) {
    const { firstName, lastName, ...rest } = donation
    return rest
  }
  return donation
}

/**
 * Fetches all donations where `processed` is true.
 * Conditionally excludes `firstName` and `lastName` if `isAnonymous` is true.
 *
 * @returns {Promise<Array<ProcessedDonation>>} Array of processed donations with selected fields.
 */
export const getProcessedDonations = async (): Promise<ProcessedDonation[]> => {
  try {
    const donations = await prisma.donation.findMany({
      where: {
        processed: true,
      },
      select: {
        isAnonymous: true,
        firstName: true,
        lastName: true,
        socialX: true,
        socialFacebook: true,
        socialLinkedIn: true,
      },
    })

    return donations.map(transformDonation)
  } catch (error) {
    console.error('Error fetching processed donations:', error)
    throw error
  }
}

export const getUnprocessedDonations = async () => {
  return await prisma.donation.findMany({
    where: {
      processed: false, // Ensure the 'processed' field is in your Donation model
    },
  })
}

export const getDonorsMatchedAmounts = async (donorIds: string[]) => {
  const matchedAmounts = await prisma.matchingDonationLog.groupBy({
    by: ['donorId'],
    where: {
      donorId: { in: donorIds },
    },
    _sum: {
      matchedAmount: true,
    },
  })

  // Convert the result to a map for easy lookup
  const donorMatchedAmountMap = new Map<string, number>()
  matchedAmounts.forEach((item) => {
    // Check if _sum.matchedAmount exists and convert to number
    const matchedAmount = item._sum.matchedAmount
      ? item._sum.matchedAmount.toNumber()
      : 0
    donorMatchedAmountMap.set(item.donorId, matchedAmount)
  })

  return donorMatchedAmountMap
}

export const getMatchedDonationsByProject = async (projectSlug: string) => {
  const result = await prisma.matchingDonationLog.aggregate({
    _sum: {
      matchedAmount: true,
    },
    where: {
      projectSlug: projectSlug,
    },
  })
  return result._sum.matchedAmount || 0
}

export const getAllDonations = async () => {
  return await prisma.donation.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const getAllLogs = async () => {
  return await prisma.log.findMany({
    orderBy: {
      timestamp: 'desc',
    },
  })
}

export const getAllWebhookEvents = async () => {
  return await prisma.webhookEvent.findMany({
    orderBy: {
      receivedAt: 'desc',
    },
  })
}

export default prisma
