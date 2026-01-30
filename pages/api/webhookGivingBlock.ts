export {}
// // pages/api/webhook.js

// import crypto from 'crypto'
// import prisma from '../../lib/prisma'
// import rateLimit from 'express-rate-limit'
// import winston from 'winston'

// // Initialize Logger
// const logger = winston.createLogger({
//   level: 'info',
//   transports: [
//     new winston.transports.Console(),
//     // Add more transports as needed (e.g., File, external logging services)
//   ],
// })

// // Rate Limiter Middleware
// const webhookLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.',
// })

// // Encryption and Signing Constants
// const dataEncryptionKey = Buffer.from(
//   process.env.GIVING_BLOCK_ENCRYPTION_KEY,
//   'hex'
// )
// const dataEncryptionIV = Buffer.from(
//   process.env.GIVING_BLOCK_ENCRYPTION_IV,
//   'hex'
// )
// const SIGNING_SECRET = process.env.GIVING_BLOCK_SIGNING_SECRET // Shared secret for signature verification

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     res.setHeader('Allow', ['POST'])
//     return res.status(405).end(`Method ${req.method} Not Allowed`)
//   }

//   // Apply Rate Limiting
//   await new Promise((resolve, reject) => {
//     webhookLimiter(req, res, (result) => {
//       if (result instanceof Error) {
//         return reject(result)
//       }
//       resolve(result)
//     })
//   })

//   try {
//     const { eventType, payload } = req.body

//     // Verify the request signature
//     if (!verifySignature(req, payload)) {
//       logger.warn('Unauthorized webhook attempt detected.')
//       return res
//         .status(401)
//         .json({ status: 'error', message: 'Unauthorized request' })
//     }

//     // Decrypt the payload
//     const decryptedPayload = decryptPayload(payload)

//     // Validate eventTimestamp
//     if (!validateTimestamp(decryptedPayload.eventTimestamp)) {
//       logger.warn('Received an old webhook event:', {
//         eventType,
//         eventTimestamp: decryptedPayload.eventTimestamp,
//       })
//       return res
//         .status(400)
//         .json({ status: 'error', message: 'Event is too old' })
//     }

//     // Process the event
//     await processEvent(eventType, decryptedPayload)

//     // Respond with success
//     res.status(200).json({ status: 'success' })
//   } catch (error) {
//     logger.error('Error handling webhook:', {
//       error: error.message,
//       stack: error.stack,
//     })
//     res.status(500).json({ status: 'error', message: 'Internal Server Error' })
//   }
// }

// /**
//  * Decrypts the AES-encrypted payload.
//  * @param {string} encryptedPayloadHex - The encrypted payload in hexadecimal format.
//  * @returns {object} - The decrypted JSON object.
//  */
// function decryptPayload(encryptedPayloadHex) {
//   const encryptedBuffer = Buffer.from(encryptedPayloadHex, 'hex')
//   const decipher = crypto.createDecipheriv(
//     'aes-256-cbc',
//     dataEncryptionKey,
//     dataEncryptionIV
//   )
//   let decrypted = decipher.update(encryptedBuffer)
//   decrypted = Buffer.concat([decrypted, decipher.final()])
//   return JSON.parse(decrypted.toString())
// }

// /**
//  * Verifies the request signature to ensure it's from The Giving Block.
//  * @param {object} req - The incoming request object.
//  * @param {string} payload - The encrypted payload.
//  * @returns {boolean} - Whether the signature is valid.
//  */
// function verifySignature(req, payload) {
//   const signature = req.headers['x-givingblock-signature']
//   if (!signature) return false

//   const hmac = crypto.createHmac('sha256', SIGNING_SECRET)
//   hmac.update(payload)
//   const expectedSignature = hmac.digest('hex')

//   try {
//     return crypto.timingSafeEqual(
//       Buffer.from(signature),
//       Buffer.from(expectedSignature)
//     )
//   } catch (error) {
//     return false
//   }
// }

// /**
//  * Validates that the event timestamp is within the acceptable range.
//  * @param {string | number} eventTimestamp - The event timestamp from the payload.
//  * @returns {boolean} - Whether the timestamp is valid.
//  */
// function validateTimestamp(eventTimestamp) {
//   const eventTime = new Date(eventTimestamp)
//   const now = new Date()
//   const oneHourInMs = 3600000
//   return now - eventTime <= oneHourInMs
// }

// /**
//  * Processes the webhook event based on its type.
//  * @param {string} eventType - The type of the event.
//  * @param {object} payload - The decrypted payload.
//  */
// async function processEvent(eventType, payload) {
//   const pledgeId = payload.pledgeId
//   const eid = payload.eid // Unique event identifier

//   if (!pledgeId) {
//     throw new Error('Missing pledgeId in payload')
//   }

//   // Start a transaction to ensure atomicity
//   await prisma.$transaction(async (prisma) => {
//     // Check if the event has already been processed (idempotency)
//     if (eid) {
//       const existingEvent = await prisma.webhookEvent.findUnique({
//         where: { eid },
//       })

//       if (existingEvent) {
//         logger.info('Event already processed', { eid })
//         return // Skip processing to prevent duplication
//       }
//     }

//     // Find the associated Donation
//     let donation = await prisma.donation.findUnique({
//       where: { pledgeId },
//     })

//     if (!donation) {
//       // Create a new Donation if it doesn't exist
//       donation = await prisma.donation.create({
//         data: {
//           pledgeId,
//           organizationId: payload.organizationId,
//           donationType: mapDonationType(payload.paymentMethod),
//           pledgeAmount: payload.amount,
//           assetSymbol: payload.currency,
//           assetDescription: payload.paymentMethod, // Adjust as needed
//           // Populate other necessary fields from payload
//           eventData: payload, // Initial event data
//         },
//       })
//       logger.info('Created new Donation record', { pledgeId })
//     } else {
//       // Update the Donation with new data based on event type
//       const updateData = mapPayloadToDonationData(
//         eventType,
//         payload,
//         donation.eventData
//       )

//       await prisma.donation.update({
//         where: { pledgeId },
//         data: {
//           ...updateData,
//           eventData: {
//             // Optionally merge with existing eventData
//             ...donation.eventData,
//             [eventType]: payload,
//           },
//           updatedAt: new Date(),
//         },
//       })
//       logger.info('Updated Donation record', { pledgeId })
//     }

//     // Create a new WebhookEvent record
//     await prisma.webhookEvent.create({
//       data: {
//         eventType,
//         payload,
//         donationId: donation.id,
//         eid, // Store the unique event identifier
//       },
//     })

//     logger.info('Created WebhookEvent record', { eventType, pledgeId, eid })
//   })
// }

// /**
//  * Maps the payload fields to the Donation model fields based on event type.
//  * @param {string} eventType - The type of the event.
//  * @param {object} payload - The decrypted payload.
//  * @param {object} existingEventData - Existing event data in the Donation record.
//  * @returns {object} - The mapped data for the Donation model.
//  */
// function mapPayloadToDonationData(eventType, payload, existingEventData) {
//   const commonData = {
//     transactionHash:
//       payload.transactionHash || existingEventData?.transactionHash || null,
//     payoutAmount:
//       payload.payoutAmount || existingEventData?.payoutAmount || null,
//     payoutCurrency:
//       payload.payoutCurrency || existingEventData?.payoutCurrency || null,
//     externalId: payload.externalId || existingEventData?.externalId || null,
//     campaignId: payload.campaignId || existingEventData?.campaignId || null,
//     valueAtDonationTimeUSD:
//       payload.valueAtDonationTimeUSD ||
//       existingEventData?.valueAtDonationTimeUSD ||
//       null,
//     // Add other common fields as necessary
//   }

//   switch (eventType) {
//     case 'DEPOSIT_TRANSACTION':
//       return {
//         status: payload.status || existingEventData?.status || null,
//         timestampms: payload.timestampms
//           ? new Date(Number(payload.timestampms))
//           : existingEventData?.timestampms || null,
//         eid: payload.eid || existingEventData?.eid || null,
//         currency: payload.currency || existingEventData?.currency || null,
//         amount: payload.amount || existingEventData?.amount || null,
//         // Add or map additional fields specific to DEPOSIT_TRANSACTION
//       }
//     case 'TRANSACTION_CONVERTED':
//       return {
//         convertedAt: payload.convertedAt
//           ? new Date(payload.convertedAt)
//           : existingEventData?.convertedAt || null,
//         netValueAmount:
//           payload.netValueAmount || existingEventData?.netValueAmount || null,
//         grossAmount:
//           payload.grossAmount || existingEventData?.grossAmount || null,
//         netValueCurrency:
//           payload.netValueCurrency ||
//           existingEventData?.netValueCurrency ||
//           null,
//         // Add or map additional fields specific to TRANSACTION_CONVERTED
//       }
//     case 'MERCHANT_STATUS_EVENT':
//       return {
//         status: payload.status || existingEventData?.status || null,
//         // Add or map additional fields specific to MERCHANT_STATUS_EVENT
//       }
//     default:
//       logger.warn('Unknown event type received', { eventType })
//       return {}
//   }
// }

// /**
//  * Maps the payment method from the payload to the DonationType enum.
//  * @param {string} paymentMethod - The payment method from the payload.
//  * @returns {DonationType} - The corresponding DonationType enum value.
//  */
// function mapDonationType(paymentMethod) {
//   switch (paymentMethod.toLowerCase()) {
//     case 'crypto':
//       return 'crypto'
//     case 'card':
//       return 'fiat'
//     case 'stock':
//       return 'stock'
//     default:
//       return 'fiat' // Default to fiat or handle as needed
//   }
// }
