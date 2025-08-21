import { NextApiRequest, NextApiResponse } from 'next'
import { getAllLogs } from '../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logs = await getAllLogs()
  res.status(200).json(logs)
}
