// /pages/api/getInfoTGB.ts

import { kv } from '@vercel/kv'
import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import Decimal from 'decimal.js'
import { Donation } from '@prisma/client'

type SuccessResponse = {
  funded_txo_sum: number
  tx_count: number
  supporters: string[]
  donatedCreatedTime: {
    valueAtDonationTimeUSD: number
    createdTime: string
  }[]
}

type ErrorResponse = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method === 'GET') {
    const slug = req.query.slug as string

    if (!slug) {
      return res.status(400).json({ message: 'Slug is required' })
    }

    try {
      const cacheKey = `tgb-info-${slug}`
      const cachedData = await kv.get(cacheKey)

      if (cachedData) {
        return res.status(200).json(cachedData as SuccessResponse)
      }

      const donations: Donation[] = await prisma.donation.findMany({
        where: {
          projectSlug: slug,
          status: {
            in: ['Complete', 'Advanced'], // Filter donations with 'Complete' or 'Advanced' status
          },
          valueAtDonationTimeUSD: {
            gte: 2,
          },
        },
      })

      if (!donations || donations.length === 0) {
        return res
          .status(404)
          .json({ message: 'No donations found for this slug.' })
      }

      // Sum of all donation amounts using Decimal for precision
      const totalAmount = donations.reduce((acc, donation) => {
        const donationAmount = donation.valueAtDonationTimeUSD
          ? new Decimal(donation.valueAtDonationTimeUSD.toString() || '0')
          : new Decimal(0)
        return acc.plus(donationAmount)
      }, new Decimal(0))

      // Unified supporter list
      const supporters: string[] = []

      donations.forEach((donation) => {
        if (donation.socialX) {
          supporters.push(`${donation.socialX}`)
        }
        // if (donation.socialLinkedIn) {
        //   supporters.push({ handle: donation.socialLinkedIn, type: 'LinkedIn' })
        // }
        // if (donation.socialFacebook) {
        //   supporters.push({ handle: donation.socialFacebook, type: 'Facebook' })
        // }
      })

      // Donation amounts with creation timestamps
      const donatedCreatedTime = donations.map((donation) => ({
        valueAtDonationTimeUSD: donation.valueAtDonationTimeUSD
          ? parseFloat(donation.valueAtDonationTimeUSD?.toString())
          : 0,
        createdTime: donation.createdAt.toISOString(),
      }))

      // Sort supporters if necessary, e.g., by creation time or handle
      // supporters.sort((a, b) => {
      //   // Example sort logic (this can be customized)
      //   return a.handle.localeCompare(b.handle) // Sort alphabetically by handle
      // })

      const responseData = {
        funded_txo_sum: totalAmount.toNumber(),
        tx_count: donations.length,
        supporters: supporters,
        donatedCreatedTime: donatedCreatedTime,
      }

      await kv.set(`tgb-info-${slug}`, responseData, { ex: 900 }) // Cache for 15 minutes

      res.status(200).json(responseData)
    } catch (err) {
      console.error('Error fetching donation info:', err)
      res.status(500).json({ message: (err as Error).message })
    }
  } else {
    res.setHeader('Allow', 'GET')
    res.status(405).end('Method Not Allowed')
  }
}
