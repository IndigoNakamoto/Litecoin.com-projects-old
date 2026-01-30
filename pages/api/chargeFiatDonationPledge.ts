// /pages/api/chargeFiatDonationPledge.
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import prisma from '../../lib/prisma' // Import your Prisma client
import { getAccessToken } from '../../utils/authTGB'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { pledgeId, cardToken } = req.body

  // Basic validation
  if (!pledgeId || !cardToken) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    const accessToken = await getAccessToken()

    // Charge the pledge via The Giving Block's API
    const chargeResponse = await axios.post(
      'https://public-api.tgbwidget.com/v1/donation/fiat/charge',
      { pledgeId, cardToken },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    // console.log('Charge Response:', chargeResponse.data)

    const { success } = chargeResponse.data.data

    // Update the donation record in Prisma with success status
    try {
      await prisma.donation.update({
        where: { pledgeId },
        data: { success: success || false },
      })
    } catch (prismaError) {
      console.error('Error updating donation status in Prisma:', prismaError)
      return res.status(500).json({ error: 'Failed to update donation record' })
    }

    // Return success response to the frontend
    return res.status(200).json({ success })
  } catch (error: any) {
    const errorMessage = `${error.response?.data?.data?.meta.message}`

    console.error(
      'Error charging fiat donation pledge:',
      errorMessage
      // error.response?.data || error.data.toString()
    )

    // Attempt to update the donation record with failure status
    try {
      await prisma.donation.update({
        where: { pledgeId },
        data: { success: false },
      })
    } catch (prismaError) {
      console.error(
        'Error updating donation failure status in Prisma:',
        prismaError
      )
    }

    // Return a more descriptive error message to the frontend if applicable
    if (error.response?.data?.errorType === 'err.generic') {
      return res.status(500).json({
        error: `${errorMessage}`,
      })
    }

    return res.status(500).json({ error: `${errorMessage}` })
  }
}
