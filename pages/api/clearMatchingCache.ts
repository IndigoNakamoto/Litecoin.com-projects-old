// /pages/api/clearMatchingCache.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  const authHeader = req.headers['authorization']
  const expectedAuthHeader = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedAuthHeader) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Get all matching-donors keys
    const keys = await kv.keys('matching-donors-*')

    console.log(
      `[${new Date().toISOString()}] Found ${
        keys.length
      } matching-donors cache keys`
    )

    // Delete each key
    for (const key of keys) {
      await kv.del(key)
      console.log(`[${new Date().toISOString()}] Cleared cache: ${key}`)
    }

    return res.status(200).json({
      message: `Cleared ${keys.length} matching-donors cache keys`,
      keys: keys,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error(
      `[${new Date().toISOString()}] Error clearing matching cache:`,
      error
    )
    return res.status(500).json({
      error: 'Failed to clear matching cache.',
      details: err.message || 'An unexpected error occurred.',
    })
  }
}

export default handler
