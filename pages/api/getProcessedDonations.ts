/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/getProcessedDonations.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getProcessedDonations, ProcessedDonation } from '../../lib/prisma'
import { kv } from '@vercel/kv'

// Define the shape of the successful response
type SuccessResponse = ProcessedDonation[]

// Define the shape of the error response
type ErrorResponse = {
  error: string
}

// Combine the response types
type Data = SuccessResponse | ErrorResponse

/**
 * Fetches processed donations with caching.
 *
 * @returns {Promise<ProcessedDonation[]>} Array of processed donations.
 */
const fetchProcessedDonations = async (): Promise<ProcessedDonation[]> => {
  const cacheKey = 'processedDonations:all'

  // Attempt to retrieve cached data
  const cachedData = await kv.get<ProcessedDonation[]>(cacheKey)

  if (cachedData !== null && cachedData !== undefined) {
    // console.log('Returning cached processed donations')
    return cachedData
  }

  try {
    // Fetch processed donations from the database
    const donations = await getProcessedDonations()

    // Cache the donations for 10 minutes (600 seconds)
    await kv.set(cacheKey, donations, { ex: 600 })

    console.log('Cached processed donations')
    return donations
  } catch (error) {
    console.error('Error fetching processed donations:', error)
    throw new Error('Failed to fetch processed donations')
  }
}

/**
 * API Handler for fetching processed donations.
 *
 * @param {NextApiRequest} req - The incoming request object.
 * @param {NextApiResponse<Data>} res - The outgoing response object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const donations = await fetchProcessedDonations()
    res.status(200).json(donations)
  } catch (error) {
    console.error('Error in getProcessedDonations handler:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
