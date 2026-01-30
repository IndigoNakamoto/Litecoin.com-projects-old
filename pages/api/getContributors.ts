/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/getContributors.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getAllActiveContributors } from '../../utils/webflow' // Adjust the path as necessary
import { kv } from '@vercel/kv'

const fetchContributors = async (): Promise<any> => {
  const cacheKey = 'contributors:all'
  const cachedContributors = await kv.get<any>(cacheKey)

  if (cachedContributors !== null && cachedContributors !== undefined) {
    return cachedContributors
  }

  try {
    const contributors = await getAllActiveContributors()
    // Cache the contributors for a certain period, e.g., 10 minutes
    await kv.set(cacheKey, contributors, { ex: 600 })
    return contributors
  } catch (error) {
    console.error('Error fetching all active contributors', error)
    throw new Error('Failed to fetch all contributors')
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | { error: string }>
) {
  try {
    const contributors = await fetchContributors()
    res.status(200).json(contributors)
  } catch (error) {
    console.error('Error in getContributors handler:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
