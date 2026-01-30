// pages/api/createStockDonationPledge.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import axios from 'axios'
import { getAccessToken } from '../../utils/authTGB'

type Data =
  | {
      donationUuid: string
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
    /// project
    organizationId,
    projectSlug,
    /// Donation
    assetSymbol,
    assetDescription,
    pledgeAmount,
    /// Donor Info
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
    phoneNumber,
    /// Donor Settings
    // taxReceipt,
    // isAnonymous,
    joinMailingList,
    /// Donor Social Profiles
    socialX,
    socialFacebook,
    socialLinkedIn,
  } = req.body

  try {
    const accessToken = await getAccessToken()
    // Start a transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Create a new Donation record without pledgeId initially
      const donation = await prisma.donation.create({
        data: {
          // Project
          projectSlug: projectSlug,
          organizationId: organizationId || null,
          // Donation
          donationType: 'stock',
          assetSymbol: assetSymbol,
          assetDescription: assetDescription,
          pledgeAmount: parseFloat(pledgeAmount),
          // Donor Info
          firstName: firstName || null,
          lastName: lastName || null,
          donorEmail: receiptEmail || null,
          // Donor Settings
          taxReceipt: true,
          isAnonymous: false,
          joinMailingList: joinMailingList || false,
          // Donor Social Profiles
          socialX: socialX || null,
          socialFacebook: socialFacebook || null,
          socialLinkedIn: socialLinkedIn || null,
        },
      })
      // Call The Giving Block's Create Stock Donation Pledge API
      const tgbResponse = await axios.post(
        'https://public-api.tgbwidget.com/v1/donation/stocks',
        {
          organizationId: organizationId,
          assetSymbol: assetSymbol,
          assetDescription: assetDescription, // TODO: fix value. It is currently set as asset symbol
          pledgeAmount: pledgeAmount,
          receiptEmail: receiptEmail,
          firstName: firstName,
          lastName: lastName,
          addressLine1: addressLine1,
          addressLine2: addressLine2,
          country: country,
          state: state,
          city: city,
          zipcode: zipcode,
          phoneNumber: phoneNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const { donationUuid } = tgbResponse.data.data

      // Update the Donation record with pledgeId
      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          donationUuid: donationUuid,
        },
      })

      return { donationUuid }
    })

    return res.status(200).json(result)
  } catch (error: any) {
    console.error('Error creating crypto donation pledge:', error.message)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
