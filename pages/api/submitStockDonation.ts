// /pages/api/submitStockDonation.ts

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

  const {
    donationUuid,
    brokerName,
    brokerageAccountNumber,
    brokerContactName,
    brokerEmail,
    brokerPhone,
  } = req.body

  if (!donationUuid || !brokerName || !brokerageAccountNumber) {
    const missingFields: string[] = [] // Specify the type here
    if (!donationUuid) missingFields.push('donationUuid')
    if (!brokerName) missingFields.push('brokerName')
    if (!brokerageAccountNumber) missingFields.push('brokerageAccountNumber')
    return res
      .status(400)
      .json({ error: `Missing required fields: ${missingFields.join(', ')}` })
  }

  try {
    const accessToken = await getAccessToken() // Retrieve The Giving Block access token

    if (!accessToken) {
      console.error('Access token is missing.')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const response = await axios.post(
      'https://public-api.tgbwidget.com/v1/stocks/submit',
      {
        donationUuid,
        brokerName,
        brokerageAccountNumber,
        brokerContactName,
        brokerEmail,
        brokerPhone,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    res.status(200).json(response.data)
  } catch (error: any) {
    // Handle errors
    console.error(
      'Error submitting stock donation:',
      error.response?.data || error.message
    )
    res
      .status(500)
      .json({ error: error.response?.data || 'Internal Server Error' })
  }
}
