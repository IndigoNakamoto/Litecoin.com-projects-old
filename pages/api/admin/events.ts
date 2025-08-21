import { NextApiRequest, NextApiResponse } from 'next'
import { getAllWebhookEvents } from '../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const events = await getAllWebhookEvents()
  res.status(200).json(events)
}
