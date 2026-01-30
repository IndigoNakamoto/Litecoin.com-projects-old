// /pages/api/getTickerCost.ts

import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { getAccessToken } from '../../utils/authTGB'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { ticker } = req.query

  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'Ticker symbol is required' })
  }

  try {
    const accessToken = await getAccessToken() // Retrieve The Giving Block access token

    if (!accessToken) {
      console.error('Access token is missing.')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const response = await axios.get(
      'https://public-api.tgbwidget.com/v1/stocks/ticker-cost',
      {
        params: { ticker },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    res.status(200).json(response.data)
  } catch (error: any) {
    // Handle errors
    console.error(
      'Error fetching ticker cost:',
      error.response?.data || error.message
    )
    res
      .status(500)
      .json({ error: error.response?.data || 'Internal Server Error' })
  }
}
