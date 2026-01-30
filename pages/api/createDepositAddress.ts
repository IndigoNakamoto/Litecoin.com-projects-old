// pages/api/createDepositAddress.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import axios from 'axios'
import { getAccessToken } from '../../utils/authTGB'
import Decimal from 'decimal.js'

function generateRandomCharacter() {
  const characters = 'abcdefghijklmnopqrstuvwxyz'
  return characters[Math.floor(Math.random() * characters.length)]
}

type Data =
  | {
      depositAddress: string
      pledgeId: string
      qrCode: string
    }
  | {
      error: string
    }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const {
    // project
    organizationId,
    projectSlug,
    // Donation
    pledgeCurrency,
    pledgeAmount,
    // Donor Info
    receiptEmail,
    firstName,
    lastName,
    /// Donor Personal Info
    addressLine1,
    addressLine2,
    country,
    state,
    city,
    zipcode,
    // Donor Settings
    taxReceipt,
    isAnonymous,
    joinMailingList,
    // Donor Social Profiles
    socialX,
    socialFacebook,
    socialLinkedIn,
  } = req.body

  // Validate always required fields
  const missingFields: string[] = []
  if (organizationId === undefined || organizationId === null)
    missingFields.push('organizationId')
  if (!pledgeCurrency) missingFields.push('pledgeCurrency')
  if (!pledgeAmount) missingFields.push('pledgeAmount')
  if (!projectSlug) missingFields.push('projectSlug')

  // If donation is not anonymous, validate additional fields
  if (isAnonymous === false) {
    if (!firstName) missingFields.push('firstName')
    if (!lastName) missingFields.push('lastName')
    if (!addressLine1) missingFields.push('addressLine1')
    if (!country) missingFields.push('country')
    if (!state) missingFields.push('state')
    if (!city) missingFields.push('city')
    if (!zipcode) missingFields.push('zipcode')
  }

  if (missingFields.length > 0) {
    return res
      .status(400)
      .json({ error: `Missing required fields: ${missingFields.join(', ')}` })
  }

  try {
    const accessToken = await getAccessToken()

    // Validate pledgeAmount
    const parsedPledgeAmount = new Decimal(pledgeAmount)
    if (parsedPledgeAmount.lte(0)) {
      throw new Error('Pledge amount must be greater than zero.')
    }

    // Create a new Donation record without pledgeId initially
    const donation = await prisma.donation.create({
      data: {
        // Project
        projectSlug: projectSlug,
        organizationId: organizationId,
        // Donation
        donationType: 'crypto',
        assetSymbol: pledgeCurrency,
        pledgeAmount: parsedPledgeAmount,
        // Donor Info
        firstName: firstName || null,
        lastName: lastName || null,
        donorEmail: receiptEmail || null,
        // Donor Settings
        isAnonymous: isAnonymous || false,
        taxReceipt: taxReceipt || false,
        joinMailingList: joinMailingList || false,
        // Donor Social Profiles
        socialX: socialX || null,
        socialFacebook: socialFacebook || null,
        socialLinkedIn: socialLinkedIn || null,
      },
    })

    // Prepare the payload for The Giving Block's CreateDepositAddress API
    const apiPayload: any = {
      organizationId: organizationId,
      isAnonymous: isAnonymous,
      pledgeCurrency: pledgeCurrency,
      pledgeAmount: parsedPledgeAmount.toString(), // Convert to string
      receiptEmail: receiptEmail,
    }

    // If the donation is not anonymous, include all required donor fields
    if (isAnonymous === false) {
      apiPayload.firstName = firstName
      apiPayload.lastName = lastName
      apiPayload.addressLine1 = addressLine1
      apiPayload.addressLine2 = addressLine2
      apiPayload.country = country
      apiPayload.state = state
      apiPayload.city = city
      apiPayload.zipcode = zipcode
    }

    // Log the payload being sent
    // console.log('Payload being sent to The Giving Block API:', apiPayload)

    // Call The Giving Block's CreateDepositAddress API
    const tgbResponse = await axios.post(
      'https://public-api.tgbwidget.com/v1/deposit-address',
      apiPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    // Check if the response has the expected data
    if (
      !tgbResponse.data ||
      !tgbResponse.data.data ||
      !tgbResponse.data.data.depositAddress ||
      !tgbResponse.data.data.pledgeId ||
      !tgbResponse.data.data.qrCode
    ) {
      throw new Error('Invalid response from external API.')
    }

    // const randomCharacter = generateRandomCharacter()
    // const pledgeId = Math.random() * 100000 + randomCharacter
    // const depositAddress = ' '
    // const qrCode = ' '
    const { depositAddress, pledgeId, qrCode } = tgbResponse.data.data

    // Update the Donation record with pledgeId and depositAddress
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        pledgeId: pledgeId,
        depositAddress: depositAddress,
        // You can also store qrCode if needed
      },
    })

    return res.status(200).json({ depositAddress, pledgeId, qrCode })
  } catch (error: any) {
    // Enhanced error logging
    if (axios.isAxiosError(error)) {
      console.error(
        'Axios error creating crypto donation pledge:',
        error.response?.data || error.message
      )
      return res.status(400).json({
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          `Bad Request: ${error.message}`,
      })
    } else {
      console.error('Error creating crypto donation pledge:', error.message)
      return res
        .status(500)
        .json({ error: `Internal Server Error: ${error.message}` })
    }
  }
}
