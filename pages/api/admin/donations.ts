import { NextApiRequest, NextApiResponse } from 'next'
import { getAllDonations } from '../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const donations = await getAllDonations()
  res.status(200).json(donations)
}
