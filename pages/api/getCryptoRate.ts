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

  const { currency } = req.query

  if (!currency) {
    return res.status(400).json({ message: 'Currency code is required' })
  }

  try {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      console.error('Access token is missing.')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const response = await axios.get(
      'https://public-api.tgbwidget.com/v1/crypto-to-usd-rate',
      {
        params: { currency },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    res.status(200).json(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message)
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.error || 'Internal Server Error',
      })
    } else {
      console.error('Unknown error:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}
