// pages/api/webhook/tgb.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import crypto from 'crypto'
import logger from '../../../lib/logger'
import { Prisma } from '@prisma/client' // Import Prisma namespace
import { processDonationMatching } from '../../../services/matching'

// Define Webhook Event Types
type WebhookEventType = 'DEPOSIT_TRANSACTION' | 'TRANSACTION_CONVERTED' | string

type DepositTransactionPayload = {
  type: string
  id: string
  status: string
  timestampms: string
  eid: string
  transactionHash?: string // Optional, may not be present for stock donations
  currency: string
  amount: number
  organizationId: number
  eventTimestamp: string
  pledgeId?: string // For crypto donations
  donationUuid?: string // For stock donations
  valueAtDonationTimeUSD: number
  paymentMethod: string
  payoutAmount: number | null
  payoutCurrency: string
  externalId: string
  campaignId: string
}

type TransactionConvertedPayload = {
  type: string
  id: string
  status: string
  timestampms: string
  eid: string
  transactionHash: string
  currency: string
  amount: number
  organizationId: number
  eventTimestamp: number
  convertedAt: string
  netValueAmount: number
  grossAmount: number
  netValueCurrency: string
  pledgeId: string
  valueAtDonationTimeUSD: number
  payoutAmount: number
  payoutCurrency: string
  externalId: string
  campaignId: string
}

type DecryptedPayload =
  | DepositTransactionPayload
  | TransactionConvertedPayload
  | any

type WebhookRequest = {
  eventType: WebhookEventType
  payload: string // Encrypted string
}

type SuccessResponse = {
  message: string
}

type ErrorResponse = {
  error: string
}

// Define a mapping of event types to handler functions
const eventHandlers: Record<
  WebhookEventType,
  (eventType: WebhookEventType, payload: DecryptedPayload) => Promise<void>
> = {
  DEPOSIT_TRANSACTION: handleDepositTransaction,
  TRANSACTION_CONVERTED: handleTransactionConverted,
  // Add new event types and their handlers here
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const webhookRequest: WebhookRequest = req.body

  try {
    // Decrypt the payload
    const decryptedPayload = decryptPayload(webhookRequest.payload)

    // Validate eventTimestamp
    const eventTimestampMs = Number(decryptedPayload.eventTimestamp)
    if (isNaN(eventTimestampMs)) {
      logger.warn('Invalid eventTimestamp:', {
        eventType: webhookRequest.eventType,
        eventTimestamp: decryptedPayload.eventTimestamp,
      })
      return res.status(400).json({ error: 'Invalid eventTimestamp' })
    }

    const currentTime = Date.now()
    const oneHourInMs = 60 * 60 * 1000

    if (currentTime - eventTimestampMs > oneHourInMs) {
      logger.warn('Received an outdated webhook event', {
        eventType: webhookRequest.eventType,
        eventTimestamp: eventTimestampMs,
      })
      return res.status(400).json({ error: 'Outdated event' })
    }

    // Forward to new database-api-server endpoint (non-blocking, for testing)
    // Set ENABLE_WEBHOOK_FORWARDING=true to enable
    const enableForwarding =
      process.env.ENABLE_WEBHOOK_FORWARDING === 'true'
    const newApiUrl =
      process.env.DATABASE_API_URL || 'https://projectsapi.lite.space'

    if (enableForwarding) {
      // Forward to new endpoint asynchronously (don't await - don't block response)
      fetch(`${newApiUrl}/api/webhook/tgb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookRequest),
      })
        .then(async (response) => {
          if (response.ok) {
            const result = await response.json()
            logger.info('Webhook forwarded to new endpoint successfully:', {
              eventType: webhookRequest.eventType,
              result,
            })
          } else {
            const errorText = await response.text()
            logger.warn('Webhook forwarding failed:', {
              eventType: webhookRequest.eventType,
              status: response.status,
              error: errorText,
            })
          }
        })
        .catch((error) => {
          logger.warn('Webhook forwarding error:', {
            eventType: webhookRequest.eventType,
            error: error.message,
          })
        })
    }

    // Determine the handler function
    const handlerFunction =
      eventHandlers[webhookRequest.eventType] || handleUnknownEvent

    // Process the event (existing logic - keep for backward compatibility)
    await handlerFunction(webhookRequest.eventType, decryptedPayload)

    // Run the matching logic
    try {
      await processDonationMatching()
        .then(() => {
          // console.log('Process completed successfully.')
        })
        .catch((error) => {
          console.error('An error occurred during processing:', error)
        })
    } catch (error) {
      logger.error('Error running matching logic:', {
        message: error.message,
        stack: error.stack,
      })
    }

    return res.status(200).json({ message: 'Webhook processed successfully' })
  } catch (error: any) {
    logger.error('Error processing webhook:', {
      message: error.message,
      stack: error.stack,
    })
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

// Utility function to decrypt payload
function decryptPayload(encryptedHex: string): DecryptedPayload {
  const algorithm = 'aes-256-cbc'
  const key = Buffer.from(process.env.TGB_AES_KEY || '', 'hex') // 32 bytes for aes-256
  const iv = Buffer.from(process.env.TGB_AES_IV || '', 'hex') // 16 bytes for aes-256-cbc

  if (key.length !== 32 || iv.length !== 16) {
    throw new Error('Invalid encryption key or IV length')
  }

  const encryptedData = Buffer.from(encryptedHex, 'hex')
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(encryptedData, undefined, 'utf8')
  decrypted += decipher.final('utf8')
  return JSON.parse(decrypted)
}

// Handler for DEPOSIT_TRANSACTION event
async function handleDepositTransaction(
  eventType: WebhookEventType,
  payload: DepositTransactionPayload
) {
  const { pledgeId, donationUuid, eid } = payload

  if ((!pledgeId && !donationUuid) || !eid) {
    throw new Error('Missing pledgeId/donationUuid or eid in payload')
  }

  // Check if the event has already been processed (idempotency)
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { eid },
  })

  if (existingEvent) {
    logger.info('Event already processed:', { eid })
    return // Skip processing to prevent duplication
  }

  // Find the associated Donation
  let donation
  if (pledgeId) {
    donation = await prisma.donation.findUnique({
      where: { pledgeId },
    })
  } else if (donationUuid) {
    donation = await prisma.donation.findUnique({
      where: { donationUuid },
    })
  }

  if (!donation) {
    throw new Error(
      `Donation with pledgeId ${pledgeId} or donationUuid ${donationUuid} not found`
    )
  }

  // Prepare update data
  const updateData: Prisma.DonationUpdateInput = {
    transactionHash: payload.transactionHash || null,
    payoutAmount: payload.payoutAmount,
    payoutCurrency: payload.payoutCurrency,
    externalId: payload.externalId,
    campaignId: payload.campaignId,
    valueAtDonationTimeUSD:
      payload.valueAtDonationTimeUSD || donation.valueAtDonationTimeUSD, // Update if provided
    currency: payload.currency,
    amount: payload.amount,
    status: payload.status,
    timestampms: new Date(Number(payload.timestampms)),
    eid: payload.eid,
    paymentMethod: payload.paymentMethod,
    eventData: Object.assign({}, donation.eventData, {
      [eventType]: payload,
    }),
    updatedAt: new Date(),
  }

  // Update the Donation record
  await prisma.donation.update({
    where: { id: donation.id },
    data: updateData,
  })

  await prisma.webhookEvent.upsert({
    where: { eid },
    update: { processed: true }, // Update if already exists
    create: {
      eventType: 'DEPOSIT_TRANSACTION',
      payload: payload,
      donationId: donation.id,
      eid: payload.eid,
      processed: true,
    },
  })

  logger.info('Processed DEPOSIT_TRANSACTION event:', {
    eid,
    pledgeId,
    donationUuid,
  })
}

// Handler for TRANSACTION_CONVERTED event
async function handleTransactionConverted(
  eventType: WebhookEventType,
  payload: TransactionConvertedPayload
) {
  const { pledgeId, eid } = payload

  if (!pledgeId || !eid) {
    throw new Error('Missing pledgeId or eid in payload')
  }

  // Check if the event has already been processed (idempotency)
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { eid },
  })

  if (existingEvent) {
    logger.info('Event already processed:', { eid })
    return // Skip processing to prevent duplication
  }

  // Find the associated Donation
  const donation = await prisma.donation.findUnique({
    where: { pledgeId },
  })

  if (!donation) {
    throw new Error(`Donation with pledgeId ${pledgeId} not found`)
  }

  // Prepare update data
  const updateData: Prisma.DonationUpdateInput = {
    convertedAt: new Date(Number(payload.convertedAt)),
    netValueAmount: payload.netValueAmount,
    grossAmount: payload.grossAmount,
    netValueCurrency: payload.netValueCurrency,
    payoutAmount: payload.payoutAmount,
    payoutCurrency: payload.payoutCurrency,
    externalId: payload.externalId,
    campaignId: payload.campaignId,
    valueAtDonationTimeUSD: payload.valueAtDonationTimeUSD,
    currency: payload.currency,
    amount: payload.amount,
    status: payload.status,
    timestampms: new Date(Number(payload.timestampms)),
    eid: payload.eid,
    eventData: Object.assign({}, donation.eventData, {
      [eventType]: payload,
    }),
    updatedAt: new Date(),
  }

  // Update the Donation record
  await prisma.donation.update({
    where: { pledgeId },
    data: updateData,
  })

  // Create a WebhookEvent record
  await prisma.webhookEvent.create({
    data: {
      eventType: 'TRANSACTION_CONVERTED',
      payload: payload,
      donationId: donation.id,
      eid: payload.eid,
      processed: true,
    },
  })

  logger.info('Processed TRANSACTION_CONVERTED event:', { eid, pledgeId })
}

// Handler for unknown or additional event types
async function handleUnknownEvent(eventType: string, payload: any) {
  const { pledgeId, donationUuid, eid } = payload

  if ((!pledgeId && !donationUuid) || !eid) {
    logger.warn(
      'Missing pledgeId/donationUuid or eid in payload for unknown event',
      {
        eventType,
      }
    )
    return
  }

  // Check if the event has already been processed (idempotency)
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { eid },
  })

  if (existingEvent) {
    logger.info('Event already processed:', { eid })
    return // Skip processing to prevent duplication
  }

  // Find the associated Donation
  let donation
  if (pledgeId) {
    donation = await prisma.donation.findUnique({
      where: { pledgeId },
    })
  } else if (donationUuid) {
    donation = await prisma.donation.findUnique({
      where: { donationUuid },
    })
  }

  if (!donation) {
    logger.warn(
      `Donation with pledgeId ${pledgeId} or donationUuid ${donationUuid} not found for unknown event`,
      { eventType }
    )
    return
  }

  // Update the Donation's eventData with the unknown event
  await prisma.donation.update({
    where: { id: donation.id },
    data: {
      eventData: {
        ...donation.eventData,
        [eventType]: payload,
      },
      updatedAt: new Date(),
    },
  })

  // Create a WebhookEvent record
  await prisma.webhookEvent.create({
    data: {
      eventType: eventType,
      payload: payload,
      donationId: donation.id,
      eid: eid,
      processed: true,
    },
  })

  logger.info('Processed unknown event type:', {
    eventType,
    eid,
    pledgeId,
    donationUuid,
  })
}
