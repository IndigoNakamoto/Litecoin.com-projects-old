// pages/api/postCurrenciesList.ts

import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { getAccessToken } from '../../utils/authTGB'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      console.error('Access token is missing.')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Match the Python script by sending an empty payload
    const payload = {}

    // Debugging logs
    // console.log('Sending request to /currencies/list with payload:', payload)
    // console.log('Using Access Token:', accessToken)

    const response = await axios.post(
      'https://public-api.tgbwidget.com/v1/currencies/list',
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    // console.log('Received response from /currencies/list:', response.data)

    // Ensure the response has the expected structure
    if (response.data && Array.isArray(response.data.data)) {
      res.status(200).json(response.data.data)
    } else {
      console.error('Unexpected response structure:', response.data)
      res.status(500).json({ error: 'Unexpected response structure' })
    }
  } catch (error) {
    // Enhanced error logging
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
