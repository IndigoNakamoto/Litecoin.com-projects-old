// pages/api/getWidgetSnippet.ts

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

  try {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      console.error('Access token is missing.')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const organizationId = '1189134331' // Ensure this is your correct organization ID
    const apiUrl = `https://public-api.tgbwidget.com/v1/organization/${organizationId}/widget-snippet`

    const requestBody = {
      uiVersion: 2,
      donationFlow: ['daf'],
      button: {
        id: 'tgb-widget-button',
        text: 'DAF',
        style: `
          width: 100%; /* Added width */
          height: 100%; /* Added height */
          font-family: "Space Grotesk", "Noto Sans", "Roboto", "Helvetica", "Arial", sans-serif;
          color: #222222;
          font-size: 14px;
          font-weight: 600;
          transition: transform 0.2s;
          transform: translateY(0px);
          cursor: pointer; /* Optional: Change cursor on hover */
        `,
      },
      scriptId: 'tgb-widget-script',
      campaignId: 'LitecoinWebsiteDAF',
    }

    // console.log(
    //   'Sending Request to Giving Block API with payload:',
    //   requestBody
    // )

    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    // console.log('Received Response from Giving Block API:', response.data)

    res.status(200).json(response.data.data)
  } catch (error: any) {
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
