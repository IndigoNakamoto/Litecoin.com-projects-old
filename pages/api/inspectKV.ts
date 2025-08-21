// pages/api/inspectKV.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  // Authenticate the request using Authorization header
  const authHeader = req.headers['authorization']
  const expectedAuthHeader = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedAuthHeader) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const keys = await kv.keys('*')
    const kvData: { [key: string]: any } = {}
    for (const key of keys) {
      kvData[key] = await kv.get(key)
    }
    res.status(200).json(kvData)
  } catch (error: any) {
    console.error('Error inspecting KV store:', error)
    res.status(500).json({
      error: 'Failed to inspect KV store.',
      details: error.message || 'An unexpected error occurred.',
    })
  }
}

export default handler
