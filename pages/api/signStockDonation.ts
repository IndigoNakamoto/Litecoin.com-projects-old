// /pages/api/signStockDonation.ts

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

  const { donationUuid, date, signature } = req.body
  // console.log('Signature: ', signature)

  // Check for missing fields and return specific errors
  if (!donationUuid) {
    return res.status(400).json({ error: 'Missing field: donationUuid' })
  }

  if (!date) {
    return res.status(400).json({ error: 'Missing field: date' })
  }

  if (!signature) {
    return res.status(400).json({ error: 'Missing field: signature' })
  }

  // if (!donorEmail) {
  //   return res.status(400).json({ error: 'Missing field: donorEmail' })
  // }

  // if (!signatoryName) {
  //   return res.status(400).json({ error: 'Missing field: signatoryName' })
  // }

  // if (consentGiven === undefined || consentGiven === null) {
  //   // Explicit check for boolean
  //   return res.status(400).json({ error: 'Missing field: consentGiven' })
  // }

  try {
    const accessToken = await getAccessToken() // Retrieve The Giving Block access token

    if (!accessToken) {
      console.error('Access token is missing.')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const response = await axios.post(
      'https://public-api.tgbwidget.com/v1/stocks/sign',
      {
        donationUuid,
        date,
        signature,
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
      'Error signing donation:',
      error.response?.data || error.message
    )
    res
      .status(500)
      .json({ error: error.response?.data || 'Internal Server Error' })
  }
}

// // pages/api/signStockDonation.ts

// // Mock storage for signed stock donations
// const mockSignedDonations = []

// export default async function handler(req, res) {
//   // Check if the request method is POST
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' })
//   }

//   const { donationUuid, date, signature } = req.body

//   // Validate the required fields
//   if (!donationUuid || !date || !signature) {
//     return res.status(400).json({ message: 'Missing required fields' })
//   }

//   try {
//     // Mock response structure as expected from the actual API
//     const mockApiResponse = {
//       data: {
//         isSuccess: true,
//       },
//       requestId: '93289774-9546-43e5-8258-3ed5a2eaa9a3', // Mocked request ID
//     }

//     // Define the type for the signed donation object
//     type SignedDonation = {
//       donationUuid: string
//       date: string
//       signature: string
//       requestId: string
//     }

//     // Create the signed donation object
//     const signedDonation: SignedDonation = {
//       donationUuid,
//       date,
//       signature,
//       requestId: mockApiResponse.requestId,
//     }

//     // Save the signed donation to the mock storage
//     mockSignedDonations.push(signedDonation as never)

//     // Respond with the mocked API data
//     res.status(200).json(mockApiResponse)
//   } catch (error) {
//     console.error('Error processing signed donation:', error.message)
//     res
//       .status(500)
//       .json({ error: 'Internal Server Error: Signing donations disabled' })
//   }
// }
