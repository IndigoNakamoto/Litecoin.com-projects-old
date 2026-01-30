// /pages/api/donor-matched-amounts.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import { getMatchingDonorById } from '../../utils/webflow' // Adjust the path to your utility file

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Extract the donor ID from the query parameters
    const { donorId } = req.query

    // Ensure the donorId is provided
    if (!donorId || typeof donorId !== 'string') {
      return res.status(400).json({ error: 'Donor ID is required' })
    }

    // Fetch the donor's field data from Webflow CMS
    const donor = await getMatchingDonorById(donorId)

    // Check if donor exists
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' })
    }

    // Fetch the matched amounts per project for the donor
    const matchedAmounts = await prisma.matchingDonationLog.groupBy({
      by: ['projectSlug'],
      where: { donorId },
      _sum: { matchedAmount: true },
    })

    // Map the results to a more readable format
    const totalMatchedPerProject = matchedAmounts.map((item) => ({
      projectSlug: item.projectSlug,
      totalMatchedAmount: item._sum.matchedAmount,
    }))

    // Return the donor's field data along with the matched amounts
    res.status(200).json({
      donorId,
      donorFieldData: donor.fieldData,
      totalMatchedPerProject,
    })
  } catch (error) {
    console.error('Error fetching matched amounts:', error)
    res.status(500).json({ error: 'Failed to fetch matched amounts' })
  }
}
