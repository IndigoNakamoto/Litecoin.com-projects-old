// pages/api/stats.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import { getAllProjects } from '../../utils/webflow' // Adjust the path as necessary
import { kv } from '@vercel/kv'
import { getMatchedDonationsForDashboard } from '../../lib/reports'
// import { Prisma } from '@prisma/client' // Import Prisma to access Decimal type

interface Stats {
  projectsSupported: number
  totalPaid: number
  donationsRaised: number
  donationsMatched: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Stats | { error: string }>
) {
  const cacheKey = 'stats:all'

  try {
    // Try to fetch the cached stats
    const cachedStats = await kv.get<Stats>(cacheKey)
    if (cachedStats) {
      return res.status(200).json(cachedStats)
    }

    // If not cached, fetch the data
    const projects = await getAllProjects()
    const totalPaid = projects.reduce((acc, project) => {
      const paid = project.fieldData['total-paid']
      return acc + (typeof paid === 'number' ? paid : 0)
    }, 0)

    const projectsSupported = await prisma.donation
      .groupBy({
        by: ['projectSlug'],
      })
      .then((grouped) => grouped.length)

    const donationsRaisedResult = await prisma.donation.aggregate({
      _sum: {
        valueAtDonationTimeUSD: true,
      },
      where: {
        status: 'Complete',
        valueAtDonationTimeUSD: {
          gte: 2,
        },
      },
    })

    const donationsRaised =
      donationsRaisedResult._sum.valueAtDonationTimeUSD?.toNumber() ?? 0

    const donationsMatched = await getMatchedDonationsForDashboard()

    const stats: Stats = {
      projectsSupported,
      totalPaid,
      donationsRaised,
      donationsMatched,
    }

    // Cache the stats for 10 minutes
    await kv.set(cacheKey, stats, { ex: 600 })

    // Revalidate the page every 10 minutes
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate')

    res.status(200).json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
